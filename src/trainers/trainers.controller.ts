import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';
import { TrainersService } from './trainers.service';

@ApiTags('trainers')
@ApiBearerAuth()
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Roles(Role.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard')
  getDashboard(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.trainersService.getTrainerDashboard(user.sub);
  }

  @Roles(Role.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.trainersService.getTrainerProfile(user.sub);
  }

  @Roles(Role.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('profile')
  updateProfile(@Req() req: Request, @Body() dto: UpdateTrainerProfileDto) {
    const user = req.user as { sub: string };
    return this.trainersService.updateTrainerProfile(user.sub, dto);
  }

  @Roles(Role.TRAINER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('profile')
  deleteProfile(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.trainersService.deleteTrainerProfile(user.sub);
  }
}
