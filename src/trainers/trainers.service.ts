import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  getTrainerDashboard(userId: string) {
    return { message: `Trainer dashboard for user ${userId}` };
  }

  async getTrainerProfile(userId: string) {
    const profile = await this.prisma.trainer.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        cref: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Trainer profile not found');
    }

    return profile;
  }

  async updateTrainerProfile(userId: string, dto: UpdateTrainerProfileDto) {
    if (
      dto.cref === undefined &&
      dto.bio === undefined &&
      dto.yearsExperience === undefined &&
      dto.approved === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    return this.prisma.trainer.upsert({
      where: { userId },
      update: {
        cref: dto.cref,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved,
      },
      create: {
        userId,
        cref: dto.cref,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved ?? false,
        certifications: [],
      },
      select: {
        id: true,
        userId: true,
        cref: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });
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
