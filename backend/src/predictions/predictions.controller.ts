import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
}
