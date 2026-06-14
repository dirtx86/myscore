import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { ScoreRule } from '../tournaments/entities/score-rule.entity';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, ScoreRule, Team, User])],
  providers: [SeedService],
})
export class SeedModule {}
