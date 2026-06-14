import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from './entities/prediction.entity';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { ScoringService } from './scoring.service';
import { MatchesModule } from '../matches/matches.module';
import { TournamentsModule } from '../tournaments/tournaments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction]),
    MatchesModule,
    TournamentsModule,
  ],
  providers: [PredictionsService, ScoringService],
  controllers: [PredictionsController],
  exports: [PredictionsService, ScoringService],
})
export class PredictionsModule {}
