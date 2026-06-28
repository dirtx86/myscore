import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Inject, forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { MatchSyncService } from './match-sync.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PublishResultDto } from './dto/publish-result.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { TournamentsService } from '../tournaments/tournaments.service';

@ApiTags('matches')
@ApiBearerAuth()
@Controller()
export class MatchesController {
  constructor(
    private matchesService: MatchesService,
    private matchSyncService: MatchSyncService,
    @Inject(forwardRef(() => LeaderboardService)) private leaderboardService: LeaderboardService,
    private tournamentsService: TournamentsService,
  ) {}

  @Get('tournaments/:tournamentId/matches')
  @ApiQuery({ name: 'group', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Param('tournamentId') tournamentId: string,
    @Query('group') group?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.matchesService.findAll(tournamentId, { group, status, search });
  }

  @Get('matches/:id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findById(id);
  }

  @Post('matches')
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch('matches/:id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }

  @Delete('matches/:id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }

  @Patch('matches/:id/result')
  @Roles(UserRole.ADMIN)
  async publishResult(@Param('id') id: string, @Body() dto: PublishResultDto) {
    const match = await this.matchesService.publishResult(id, dto);
    const rules = await this.tournamentsService.getScoreRules(match.tournamentId);
    await this.leaderboardService.recalculateForMatch(
      id,
      dto.homeScore,
      dto.awayScore,
      match.tournamentId,
      {
        totoPts: rules.totoPts,
        fullScorePts: rules.fullScorePts,
        goalDiffPts: rules.goalDiffPts,
      },
    );
    return match;
  }

  @Patch('matches/:id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
  }

  @Patch('matches/:id/stream')
  @Roles(UserRole.ADMIN)
  updateStream(@Param('id') id: string, @Body() dto: UpdateStreamDto) {
    return this.matchesService.updateStream(id, dto);
  }

  @Post('tournaments/:tournamentId/matches/import')
  @Roles(UserRole.ADMIN)
  importMatches(@Param('tournamentId') tournamentId: string) {
    return this.matchSyncService.importMatches(tournamentId);
  }
}
