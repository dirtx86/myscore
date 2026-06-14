import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Match } from '../matches/entities/match.entity';
import { LeaderboardEntry } from '../leaderboard/entities/leaderboard-entry.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, Match, LeaderboardEntry])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
