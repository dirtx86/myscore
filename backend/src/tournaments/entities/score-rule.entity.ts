import {
  Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn,
} from 'typeorm';
import { Tournament } from './tournament.entity';

@Entity('score_rules')
export class ScoreRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Tournament, (t) => t.scoreRule)
  @JoinColumn()
  tournament: Tournament;

  @Column()
  tournamentId: string;

  @Column({ default: 1 })
  totoPts: number;

  @Column({ default: 3 })
  fullScorePts: number;

  @Column({ default: 1 })
  goalDiffPts: number;
}
