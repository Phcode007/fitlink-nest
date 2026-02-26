import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './interfaces';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role ?? Role.USER,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const updateData: { email?: string; passwordHash?: string } = {};

    if (dto.email) {
      const existingWithEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingWithEmail && existingWithEmail.id !== userId) {
        throw new BadRequestException('E-mail already in use');
      }

      updateData.email = dto.email;
    }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (!updateData.email && !updateData.passwordHash) {
      throw new BadRequestException('No valid fields provided for update');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
