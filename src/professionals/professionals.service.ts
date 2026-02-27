import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchProfessionalsDto } from './dto/search-professionals.dto';

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchProfessionalsDto) {
    const roleFilter = this.resolveRoleFilter(query.role);

    const users = await this.prisma.user.findMany({
      where: {
        role: roleFilter,
        isActive: true,
        OR: [
          {
            name: {
              contains: query.q,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query.q,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      data: users,
    };
  }

  private resolveRoleFilter(role?: string): Prisma.EnumRoleFilter | Role {
    if (!role || role === 'ALL') {
      return {
        in: [Role.TRAINER, Role.NUTRITIONIST],
      };
    }

    return role as Role;
  }
}
