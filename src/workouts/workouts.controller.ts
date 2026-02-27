import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutsService } from './workouts.service';

@ApiTags('workouts')
@ApiBearerAuth()
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  list(@Req() req: Request, @Query() pagination: PaginationDto) {
    const user = req.user as { sub: string } | undefined;
    return this.workoutsService.listWorkoutPlans({
      userId: user?.sub,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
  }

  @Roles(Role.TRAINER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkoutDto) {
    const user = req.user as { sub: string; role: Role };
    return this.workoutsService.createWorkoutPlan(user, dto);
  }

  @Roles(Role.TRAINER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateWorkoutDto) {
    const user = req.user as { sub: string; role: Role };
    return this.workoutsService.updateWorkoutPlan(user, id, dto);
  }

  @Roles(Role.TRAINER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { sub: string; role: Role };
    return this.workoutsService.deleteWorkoutPlan(user, id);
  }
}
