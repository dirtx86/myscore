import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { UpdateScoreRulesDto } from './dto/update-score-rules.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('tournaments')
@ApiBearerAuth()
@Controller('tournaments')
export class TournamentsController {
  constructor(private tournamentsService: TournamentsService) {}

  @Get('active')
  getActive() { return this.tournamentsService.findActive(); }

  @Get(':id/score-rules')
  getScoreRules(@Param('id') id: string) {
    return this.tournamentsService.getScoreRules(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: { lockMinutes?: number }) {
    return this.tournamentsService.update(id, body);
  }

  @Patch(':id/score-rules')
  @Roles(UserRole.ADMIN)
  updateScoreRules(@Param('id') id: string, @Body() dto: UpdateScoreRulesDto) {
    return this.tournamentsService.updateScoreRules(id, dto);
  }
}
