import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  getTrainerDashboard(userId: string) {
    return { message: `Trainer dashboard for user ${userId}` };
  }

  async updateTrainerProfile(userId: string, dto: UpdateTrainerProfileDto) {
    if (
      dto.bio === undefined &&
      dto.yearsExperience === undefined &&
      dto.approved === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    return this.prisma.trainer.upsert({
      where: { userId },
      update: {
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved,
      },
      create: {
        userId,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved ?? false,
        certifications: [],
      },
      select: {
        id: true,
        userId: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });
  }
}
