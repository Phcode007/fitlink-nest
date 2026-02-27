import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  getProgress(params?: { userId?: string; page?: number; pageSize?: number }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const pageSize =
      params?.pageSize && params.pageSize > 0 && params.pageSize <= 100
        ? params.pageSize
        : 20;
    const skip = (page - 1) * pageSize;

    return this.prisma.bodyMetric.findMany({
      where: params?.userId ? { userId: params.userId } : undefined,
      select: {
        id: true,
        userId: true,
        measuredAt: true,
        weightKg: true,
        bodyFatPercent: true,
        muscleMassKg: true,
        bmi: true,
        notes: true,
      },
      orderBy: { measuredAt: 'desc' },
      skip,
      take: pageSize,
    });
  }

  async updateProgress(id: string, dto: UpdateProgressDto) {
    if (
      dto.weightKg === undefined &&
      dto.bodyFatPercent === undefined &&
      dto.muscleMassKg === undefined &&
      dto.bmi === undefined &&
      dto.notes === undefined
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existing = await this.prisma.bodyMetric.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Progress entry not found');
    }

    return this.prisma.bodyMetric.update({
      where: { id },
      data: {
        weightKg: dto.weightKg,
        bodyFatPercent: dto.bodyFatPercent,
        muscleMassKg: dto.muscleMassKg,
        bmi: dto.bmi,
        notes: dto.notes,
      },
      select: {
        id: true,
        userId: true,
        measuredAt: true,
        weightKg: true,
        bodyFatPercent: true,
        muscleMassKg: true,
        bmi: true,
        notes: true,
      },
    });
  }

  async deleteProgress(id: string) {
    const existing = await this.prisma.bodyMetric.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Progress entry not found');
    }

    return this.prisma.bodyMetric.delete({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });
  }
}
