import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DietsService } from './diets.service';

@ApiTags('diets')
@Controller('diets')
export class DietsController {
  constructor(private readonly dietsService: DietsService) {}

  @Get()
  list() {
    return this.dietsService.listDietPlans();
  }
}
