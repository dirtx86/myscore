import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchSyncService } from './match-sync.service';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    TournamentsModule,
    forwardRef(() => LeaderboardModule),
  ],
  providers: [MatchesService, MatchSyncService],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
