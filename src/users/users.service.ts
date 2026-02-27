import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { CreateUserInput } from './interfaces';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        cpf: input.cpf,
        passwordHash: input.passwordHash,
        role: input.role ?? Role.USER,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findByCpf(cpf: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { cpf } });
  }

  async findByIdOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        cpf: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const updateData: {
      email?: string;
      username?: string;
      cpf?: string;
      passwordHash?: string;
    } = {};

    if (dto.email) {
      const existingWithEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingWithEmail && existingWithEmail.id !== userId) {
        throw new BadRequestException('E-mail already in use');
      }

      updateData.email = dto.email;
    }

    if (dto.username) {
      const existingWithUsername = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (existingWithUsername && existingWithUsername.id !== userId) {
        throw new BadRequestException('Username already in use');
      }

      updateData.username = dto.username;
    }

    if (dto.cpf) {
      const existingWithCpf = await this.prisma.user.findUnique({
        where: { cpf: dto.cpf },
      });

      if (existingWithCpf && existingWithCpf.id !== userId) {
        throw new BadRequestException('CPF already in use');
      }

      updateData.cpf = dto.cpf;
    }

    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (
      !updateData.email &&
      !updateData.username &&
      !updateData.cpf &&
      !updateData.passwordHash
    ) {
      throw new BadRequestException('No valid fields provided for update');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        cpf: true,
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
        username: true,
        cpf: true,
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
        username: true,
        cpf: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
