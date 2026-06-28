import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { AdminBackfillDto } from './dto/admin-backfill.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('predictions')
@ApiBearerAuth()
@Controller('predictions')
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Get('me')
  getMyPredictions(
    @CurrentUser() user: any,
    @Query('tournamentId') tournamentId: string,
  ) {
    return this.predictionsService.findMyPredictions(user.id, tournamentId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreatePredictionDto) {
    return this.predictionsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdatePredictionDto,
  ) {
    return this.predictionsService.update(user.id, id, dto);
  }

  @Get('admin/user')
  @Roles(UserRole.ADMIN)
  getForUser(
    @Query('userId') userId: string,
    @Query('tournamentId') tournamentId: string,
  ) {
    return this.predictionsService.findForUser(userId, tournamentId);
  }

  @Get('admin/exact-winners')
  @Roles(UserRole.ADMIN)
  getExactWinners(@Query('tournamentId') tournamentId: string) {
    return this.predictionsService.getExactWinners(tournamentId);
  }

  @Post('admin/backfill')
  @Roles(UserRole.ADMIN)
  adminBackfill(@Body() dto: AdminBackfillDto) {
    return this.predictionsService.adminBackfill(dto.userId, dto.matchId, dto.homeScore, dto.awayScore);
  }
}
