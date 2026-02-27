import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';

@Injectable()
export class DietsService {
  constructor(private readonly prisma: PrismaService) {}

  listDietPlans(params?: { userId?: string; page?: number; pageSize?: number }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const pageSize =
      params?.pageSize && params.pageSize > 0 && params.pageSize <= 100
        ? params.pageSize
        : 20;
    const skip = (page - 1) * pageSize;

    return this.prisma.dietPlan.findMany({
      where: params?.userId ? { userId: params.userId } : undefined,
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
      skip,
      take: pageSize,
    });
  }

  async createDietPlan(
    actor: { sub: string; role: Role },
    dto: CreateDietDto,
  ) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { userId: actor.sub },
      select: { id: true, professionalRegistration: true },
    });

    if (!nutritionist) {
      throw new ForbiddenException('Nutritionist profile required');
    }

    if (!nutritionist.professionalRegistration) {
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

    return this.prisma.dietPlan.create({
      data: {
        nutritionistId: nutritionist.id,
        userId: targetUserId,
        title: dto.title,
        description: dto.description,
        dailyCalories: dto.dailyCalories,
        isActive: dto.isActive ?? true,
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

  async updateDietPlan(
    actor: { sub: string; role: Role },
    id: string,
    dto: UpdateDietDto,
  ) {
    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.dailyCalories === undefined &&
      dto.isActive === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existing = await this.prisma.dietPlan.findUnique({
      where: { id },
      select: {
        id: true,
        nutritionist: { select: { userId: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Diet plan not found');
    }

    if (
      actor.role !== Role.ADMIN &&
      existing.nutritionist.userId !== actor.sub
    ) {
      throw new ForbiddenException('You are not allowed to modify this diet');
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

  async deleteDietPlan(actor: { sub: string; role: Role }, id: string) {
    const existing = await this.prisma.dietPlan.findUnique({
      where: { id },
      select: {
        id: true,
        nutritionist: { select: { userId: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Diet plan not found');
    }

    if (
      actor.role !== Role.ADMIN &&
      existing.nutritionist.userId !== actor.sub
    ) {
      throw new ForbiddenException('You are not allowed to delete this diet');
    }

    await this.prisma.dietPlan.delete({ where: { id } });

    return { ok: true };
  }
}
