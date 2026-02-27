import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('E-mail already in use');
    }

    if (dto.username) {
      const existingWithUsername = await this.usersService.findByUsername(
        dto.username,
      );

      if (existingWithUsername) {
        throw new BadRequestException('Username already in use');
      }
    }

    if (dto.cpf) {
      const existingWithCpf = await this.usersService.findByCpf(dto.cpf);

      if (existingWithCpf) {
        throw new BadRequestException('CPF already in use');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      cpf: dto.cpf,
      passwordHash,
      role: dto.role,
    });

    return this.signToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.email, user.role);
  }

  private signToken(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
      role,
    });

    return { accessToken };
  }
}
