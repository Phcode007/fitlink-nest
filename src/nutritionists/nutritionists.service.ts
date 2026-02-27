import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNutritionistProfileDto } from './dto/update-nutritionist-profile.dto';

@Injectable()
export class NutritionistsService {
  constructor(private readonly prisma: PrismaService) {}

  getNutritionistDashboard(userId: string) {
    return { message: `Nutritionist dashboard for user ${userId}` };
  }

  async getNutritionistProfile(userId: string) {
    const profile = await this.prisma.nutritionist.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        crn: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Nutritionist profile not found');
    }

    return profile;
  }

  async updateNutritionistProfile(
    userId: string,
    dto: UpdateNutritionistProfileDto,
  ) {
    if (
      dto.crn === undefined &&
      dto.bio === undefined &&
      dto.yearsExperience === undefined &&
      dto.approved === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    return this.prisma.nutritionist.upsert({
      where: { userId },
      update: {
        crn: dto.crn,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved,
      },
      create: {
        userId,
        crn: dto.crn,
        bio: dto.bio,
        yearsExperience: dto.yearsExperience,
        approved: dto.approved ?? false,
        certifications: [],
      },
      select: {
        id: true,
        userId: true,
        crn: true,
        bio: true,
        yearsExperience: true,
        approved: true,
        updatedAt: true,
      },
    });
  }
}
