import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateDietDto } from './dto/update-diet.dto';
import { DietsService } from './diets.service';

@ApiTags('diets')
@Controller('diets')
export class DietsController {
  constructor(private readonly dietsService: DietsService) {}

  @Get()
  list() {
    return this.dietsService.listDietPlans();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDietDto) {
    return this.dietsService.updateDietPlan(id, dto);
  }
}
