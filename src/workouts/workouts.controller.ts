import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutsService } from './workouts.service';

@ApiTags('workouts')
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get()
  list() {
    return this.workoutsService.listWorkoutPlans();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkoutDto) {
    return this.workoutsService.updateWorkoutPlan(id, dto);
  }
}
