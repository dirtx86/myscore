import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';

@Entity('predictions')
@Unique(['userId', 'matchId'])
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.predictions)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Match)
  @JoinColumn()
  match: Match;

  @Column()
  matchId: string;

  @Column({ type: 'int' })
  homeScore: number;

  @Column({ type: 'int' })
  awayScore: number;

  @Column({ nullable: true, type: 'int' })
  pointsEarned: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
