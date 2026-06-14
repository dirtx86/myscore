import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { Match } from '../../matches/entities/match.entity';
import { ScoreRule } from './score-rule.entity';
import { LeaderboardEntry } from '../../leaderboard/entities/leaderboard-entry.entity';

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 15 })
  lockMinutes: number;

  @OneToMany(() => Team, (t) => t.tournament)
  teams: Team[];

  @OneToMany(() => Match, (m) => m.tournament)
  matches: Match[];

  @OneToOne(() => ScoreRule, (sr) => sr.tournament)
  scoreRule: ScoreRule;

  @OneToMany(() => LeaderboardEntry, (e) => e.tournament)
  leaderboardEntries: LeaderboardEntry[];
}
