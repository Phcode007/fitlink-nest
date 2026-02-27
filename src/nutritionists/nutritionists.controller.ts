import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { UpdateNutritionistProfileDto } from './dto/update-nutritionist-profile.dto';
import { NutritionistsService } from './nutritionists.service';

@ApiTags('nutritionists')
@ApiBearerAuth()
@Controller('nutritionists')
export class NutritionistsController {
  constructor(private readonly nutritionistsService: NutritionistsService) {}

  @Roles(Role.NUTRITIONIST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard')
  getDashboard(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.nutritionistsService.getNutritionistDashboard(user.sub);
  }

  @Roles(Role.NUTRITIONIST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.nutritionistsService.getNutritionistProfile(user.sub);
  }

  @Roles(Role.NUTRITIONIST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('profile')
  updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateNutritionistProfileDto,
  ) {
    const user = req.user as { sub: string };
    return this.nutritionistsService.updateNutritionistProfile(user.sub, dto);
  }

  @Roles(Role.NUTRITIONIST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('profile')
  deleteProfile(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.nutritionistsService.deleteNutritionistProfile(user.sub);
  }
}
