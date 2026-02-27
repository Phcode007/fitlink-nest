import { Body, Controller, Delete, Get, Param, Put, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  list(@Req() req: Request, @Query() pagination: PaginationDto) {
    const user = req.user as { sub: string } | undefined;
    return this.progressService.getProgress({
      userId: user?.sub,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
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
