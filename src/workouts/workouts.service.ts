import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  listWorkoutPlans() {
    return this.prisma.workoutPlan.findMany({
      select: {
        id: true,
        trainerId: true,
        userId: true,
        title: true,
        description: true,
        isActive: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateWorkoutPlan(id: string, dto: UpdateWorkoutDto) {
    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.isActive === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existing = await this.prisma.workoutPlan.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Workout plan not found');
    }

    return this.prisma.workoutPlan.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive,
      },
      select: {
        id: true,
        trainerId: true,
        userId: true,
        title: true,
        description: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
