import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  list() {
    return this.progressService.getProgress();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProgressDto) {
    return this.progressService.updateProgress(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.progressService.deleteProgress(id);
  }
}
