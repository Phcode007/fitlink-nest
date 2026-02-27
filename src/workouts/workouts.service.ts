import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  listWorkoutPlans(params?: { userId?: string; page?: number; pageSize?: number }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const pageSize =
      params?.pageSize && params.pageSize > 0 && params.pageSize <= 100
        ? params.pageSize
        : 20;
    const skip = (page - 1) * pageSize;

    return this.prisma.workoutPlan.findMany({
      where: params?.userId ? { userId: params.userId } : undefined,
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
      skip,
      take: pageSize,
    });
  }

  async createWorkoutPlan(
    actor: { sub: string; role: Role },
    dto: CreateWorkoutDto,
  ) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { userId: actor.sub },
      select: { id: true, professionalRegistration: true },
    });

    if (!trainer) {
      throw new ForbiddenException('Trainer profile required');
    }

    if (!trainer.professionalRegistration) {
      throw new BadRequestException(
        'Professional registration is required for onboarding',
      );
    }

    const targetUserId = dto.userId ?? actor.sub;

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    return this.prisma.workoutPlan.create({
      data: {
        trainerId: trainer.id,
        userId: targetUserId,
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive ?? true,
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

  async updateWorkoutPlan(
    actor: { sub: string; role: Role },
    id: string,
    dto: UpdateWorkoutDto,
  ) {
    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.isActive === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existing = await this.prisma.workoutPlan.findUnique({
      where: { id },
      select: {
        id: true,
        trainer: { select: { userId: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Workout plan not found');
    }

    if (actor.role !== Role.ADMIN && existing.trainer.userId !== actor.sub) {
      throw new ForbiddenException('You are not allowed to modify this workout');
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

  async deleteWorkoutPlan(actor: { sub: string; role: Role }, id: string) {
    const existing = await this.prisma.workoutPlan.findUnique({
      where: { id },
      select: {
        id: true,
        trainer: { select: { userId: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Workout plan not found');
    }

    if (actor.role !== Role.ADMIN && existing.trainer.userId !== actor.sub) {
      throw new ForbiddenException('You are not allowed to delete this workout');
    }

    await this.prisma.workoutPlan.delete({ where: { id } });

    return { ok: true };
  }
}
