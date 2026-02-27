import {
  BadRequestException,
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('complete')
  complete(@Req() req: Request, @Body() dto: CompleteOnboardingDto) {
    const user = req.user as { sub?: string };

    if (!user?.sub) {
      throw new BadRequestException('Invalid authenticated user');
    }

    return this.onboardingService.complete(user.sub, dto);
  }
}
