import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get()
  getStats(@Query('tournamentId') tournamentId: string) {
    return this.statsService.getStats(tournamentId);
  }
}
