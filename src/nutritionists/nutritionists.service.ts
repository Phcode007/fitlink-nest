import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNutritionistProfileDto } from './dto/update-nutritionist-profile.dto';

@Injectable()
export class NutritionistsService {
  constructor(private readonly prisma: PrismaService) {}

  getNutritionistDashboard(userId: string) {
    return { message: `Nutritionist dashboard for user ${userId}` };
  }

  async updateNutritionistProfile(
    userId: string,
    dto: UpdateNutritionistProfileDto,
  ) {
    if (
      dto.bio === undefined &&
      dto.yearsExperience === undefined &&
      dto.approved === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    return this.prisma.nutritionist.upsert({
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
