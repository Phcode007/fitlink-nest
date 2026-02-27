import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  listSubscriptions() {
    return this.prisma.subscription.findMany({
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
