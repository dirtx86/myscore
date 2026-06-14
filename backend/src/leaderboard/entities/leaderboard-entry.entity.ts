import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { User } from '../../users/entities/user.entity';

@Entity('leaderboard_entries')
@Unique(['tournamentId', 'userId'])
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tournament, (t) => t.leaderboardEntries)
  @JoinColumn()
  tournament: Tournament;

  @Column()
  tournamentId: string;

  @ManyToOne(() => User, (u) => u.leaderboardEntries)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ default: 0 })
  totalPts: number;

  @Column({ default: 0 })
  fullCount: number;

  @Column({ default: 0 })
  totoCount: number;

  @Column({ default: 0 })
  goalDiffCount: number;

  @Column({ default: 0 })
  playedCount: number;
}
