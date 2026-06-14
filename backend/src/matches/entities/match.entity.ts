import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Team } from '../../teams/entities/team.entity';

export enum MatchStage {
  GROUP = 'group',
  R32 = 'r32',
  R16 = 'r16',
  QF = 'qf',
  SF = 'sf',
  THIRD_PLACE = 'third_place',
  FINAL = 'final',
}

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LOCKED = 'locked',
  LIVE = 'live',
  COMPLETED = 'completed',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tournament, (t) => t.matches)
  @JoinColumn()
  tournament: Tournament;

  @Column()
  tournamentId: string;

  @ManyToOne(() => Team)
  @JoinColumn()
  homeTeam: Team;

  @Column()
  homeTeamId: string;

  @ManyToOne(() => Team)
  @JoinColumn()
  awayTeam: Team;

  @Column()
  awayTeamId: string;

  @Column({ type: 'timestamptz' })
  kickoffAt: Date;

  @Column({ type: 'enum', enum: MatchStage })
  stage: MatchStage;

  @Column({ nullable: true, length: 1 })
  groupLabel: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
  status: MatchStatus;

  @Column({ nullable: true, type: 'int' })
  homeScore: number;

  @Column({ nullable: true, type: 'int' })
  awayScore: number;

  @Column({ nullable: true, type: 'int' })
  externalId: number | null;
}
