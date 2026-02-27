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
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';
import { DietsService } from './diets.service';

@ApiTags('diets')
@ApiBearerAuth()
@Controller('diets')
export class DietsController {
  constructor(private readonly dietsService: DietsService) {}

  @Get()
  list(@Req() req: Request, @Query() pagination: PaginationDto) {
    const user = req.user as { sub: string } | undefined;
    return this.dietsService.listDietPlans({
      userId: user?.sub,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
  }

  @Roles(Role.NUTRITIONIST, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateDietDto) {
    const user = req.user as { sub: string; role: Role };
    return this.dietsService.createDietPlan(user, dto);
  }

  @Roles(Role.NUTRITIONIST, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateDietDto) {
    const user = req.user as { sub: string; role: Role };
    return this.dietsService.updateDietPlan(user, id, dto);
  }

  @Roles(Role.NUTRITIONIST, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { sub: string; role: Role };
    return this.dietsService.deleteDietPlan(user, id);
  }
}
