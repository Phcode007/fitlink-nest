import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  listSubscriptions(params?: { userId?: string; page?: number; pageSize?: number }) {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const pageSize =
      params?.pageSize && params.pageSize > 0 && params.pageSize <= 100
        ? params.pageSize
        : 20;
    const skip = (page - 1) * pageSize;

    return this.prisma.subscription.findMany({
      where: params?.userId ? { userId: params.userId } : undefined,
      select: {
        id: true,
        userId: true,
        planName: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    });
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    if (dto.planName === undefined && dto.status === undefined) {
      throw new BadRequestException('No valid fields provided for update');
    }

    const existing = await this.prisma.subscription.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        planName: dto.planName,
        status: dto.status,
      },
      select: {
        id: true,
        userId: true,
        planName: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        updatedAt: true,
      },
    });
  }

  async deleteSubscription(id: string) {
    const existing = await this.prisma.subscription.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.delete({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });
  }
}
