import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async complete(userId: string, dto: CompleteOnboardingDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      (user.role === Role.TRAINER || user.role === Role.NUTRITIONIST) &&
      !dto.professionalRegistration
    ) {
      throw new BadRequestException(
        'Professional registration is required for onboarding',
      );
    }

    const heightMeters = dto.heightCm / 100;
    const bmi = dto.weightKg / (heightMeters * heightMeters);
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.userProfile.upsert({
        where: { userId },
        update: {
          heightCm: dto.heightCm,
          weightKg: dto.weightKg,
        },
        create: {
          userId,
          fullName: user.name ?? user.email,
          heightCm: dto.heightCm,
          weightKg: dto.weightKg,
        },
        select: {
          id: true,
          userId: true,
          fullName: true,
          heightCm: true,
          weightKg: true,
          updatedAt: true,
        },
      });

      const progress = await tx.bodyMetric.create({
        data: {
          userId,
          weightKg: dto.weightKg,
          bmi,
          notes: `Height used for BMI: ${dto.heightCm} cm`,
        },
        select: {
          id: true,
          userId: true,
          weightKg: true,
          bmi: true,
          notes: true,
          measuredAt: true,
        },
      });

      const latestSubscription = await tx.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      const subscription = latestSubscription
        ? await tx.subscription.update({
            where: { id: latestSubscription.id },
            data: {
              planName: dto.plan,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd: nextMonth,
            },
            select: {
              id: true,
              userId: true,
              planName: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
            },
          })
        : await tx.subscription.create({
            data: {
              userId,
              planName: dto.plan,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd: nextMonth,
            },
            select: {
              id: true,
              userId: true,
              planName: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
            },
          });

      let professional: Record<string, unknown> | null = null;

      if (user.role === Role.TRAINER) {
        professional = await tx.trainer.upsert({
          where: { userId },
          update: {
            professionalRegistration: dto.professionalRegistration,
            bio: dto.bio,
            yearsExperience: dto.yearsExperience,
          },
          create: {
            userId,
            professionalRegistration: dto.professionalRegistration,
            bio: dto.bio,
            yearsExperience: dto.yearsExperience,
            certifications: [],
          },
          select: {
            id: true,
            userId: true,
            professionalRegistration: true,
            bio: true,
            yearsExperience: true,
            approved: true,
          },
        });
      }

      if (user.role === Role.NUTRITIONIST) {
        professional = await tx.nutritionist.upsert({
          where: { userId },
          update: {
            professionalRegistration: dto.professionalRegistration,
            bio: dto.bio,
            yearsExperience: dto.yearsExperience,
          },
          create: {
            userId,
            professionalRegistration: dto.professionalRegistration,
            bio: dto.bio,
            yearsExperience: dto.yearsExperience,
            certifications: [],
          },
          select: {
            id: true,
            userId: true,
            professionalRegistration: true,
            bio: true,
            yearsExperience: true,
            approved: true,
          },
        });
      }

      return {
        profile,
        progress,
        subscription,
        professional,
      };
    });
  }
}

