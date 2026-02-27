import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrainerDashboard(userId: string) {
    const trainer = await this.prisma.trainer.findUnique({
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

    if (!trainer) {
      throw new NotFoundException('Trainer profile not found');
    }

    const students = await this.prisma.user.findMany({
      where: {
        workoutPlans: {
          some: {
            trainerId: trainer.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      trainer: {
        ...trainer,
        cref: trainer.professionalRegistration,
      },
      students,
    };
  }

  async getTrainerProfile(userId: string) {
    const profile = await this.prisma.trainer.findUnique({
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
      throw new NotFoundException('Trainer profile not found');
    }

    return {
      ...profile,
      cref: profile.professionalRegistration,
    };
  }

  async updateTrainerProfile(userId: string, dto: UpdateTrainerProfileDto) {
    const normalizedProfessionalRegistration =
      dto.professionalRegistration ?? dto.cref;

    if (
      normalizedProfessionalRegistration === undefined &&
      dto.bio === undefined &&
      dto.yearsExperience === undefined &&
      dto.approved === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existingProfile = await this.prisma.trainer.findUnique({
      where: { userId },
      select: { id: true, professionalRegistration: true },
    });

    if (!existingProfile && !normalizedProfessionalRegistration) {
      throw new BadRequestException(
        'Professional registration is required for onboarding',
      );
    }

    const profile = await this.prisma.trainer.upsert({
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
      cref: profile.professionalRegistration,
    };
  }

  async deleteTrainerProfile(userId: string) {
    const existing = await this.prisma.trainer.findUnique({ where: { userId } });

    if (!existing) {
      throw new NotFoundException('Trainer profile not found');
    }

    return this.prisma.trainer.delete({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });
  }
}


