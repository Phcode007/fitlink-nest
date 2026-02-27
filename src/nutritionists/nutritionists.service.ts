import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNutritionistProfileDto } from './dto/update-nutritionist-profile.dto';

@Injectable()
export class NutritionistsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNutritionistDashboard(userId: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        professionalRegistration: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });

    if (!nutritionist) {
      throw new NotFoundException('Nutritionist profile not found');
    }

    const patients = await this.prisma.user.findMany({
      where: {
        dietPlans: {
          some: {
            nutritionistId: nutritionist.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      nutritionist: {
        ...nutritionist,
        crn: nutritionist.professionalRegistration,
      },
      patients,
    };
  }

  async getNutritionistProfile(userId: string) {
    const profile = await this.prisma.nutritionist.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        professionalRegistration: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Nutritionist profile not found');
    }

    return {
      ...profile,
      crn: profile.professionalRegistration,
    };
  }

  async updateNutritionistProfile(
    userId: string,
    dto: UpdateNutritionistProfileDto,
  ) {
    const normalizedProfessionalRegistration =
      dto.professionalRegistration ?? dto.crn;

    if (
      normalizedProfessionalRegistration === undefined &&
      dto.bio === undefined &&
      dto.yearsExperience === undefined &&
      dto.approved === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existingProfile = await this.prisma.nutritionist.findUnique({
      where: { userId },
      select: { id: true, professionalRegistration: true },
    });

    if (!existingProfile && !normalizedProfessionalRegistration) {
      throw new BadRequestException(
        'Professional registration is required for onboarding',
      );
    }

    const profile = await this.prisma.nutritionist.upsert({
      where: { userId },
      update: {
        professionalRegistration: normalizedProfessionalRegistration,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved,
      },
      create: {
        userId,
        professionalRegistration: normalizedProfessionalRegistration,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved ?? false,
        certifications: [],
      },
      select: {
        id: true,
        userId: true,
        professionalRegistration: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });

    return {
      ...profile,
      crn: profile.professionalRegistration,
    };
  }

  async deleteNutritionistProfile(userId: string) {
    const existing = await this.prisma.nutritionist.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Nutritionist profile not found');
    }

    return this.prisma.nutritionist.delete({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });
  }
}
