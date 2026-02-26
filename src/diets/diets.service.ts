import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDietDto } from './dto/update-diet.dto';

@Injectable()
export class DietsService {
  constructor(private readonly prisma: PrismaService) {}

  listDietPlans() {
    return this.prisma.dietPlan.findMany({
      select: {
        id: true,
        nutritionistId: true,
        userId: true,
        title: true,
        description: true,
        dailyCalories: true,
        isActive: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateDietPlan(id: string, dto: UpdateDietDto) {
    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.dailyCalories === undefined &&
      dto.isActive === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existing = await this.prisma.dietPlan.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Diet plan not found');
    }

    return this.prisma.dietPlan.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        dailyCalories: dto.dailyCalories,
        isActive: dto.isActive,
      },
      select: {
        id: true,
        nutritionistId: true,
        userId: true,
        title: true,
        description: true,
        dailyCalories: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
