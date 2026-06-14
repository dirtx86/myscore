import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Prediction } from '../../predictions/entities/prediction.entity';
import { LeaderboardEntry } from '../../leaderboard/entities/leaderboard-entry.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  displayName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  mustChangePassword: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Prediction, (p) => p.user)
  predictions: Prediction[];

  @OneToMany(() => LeaderboardEntry, (e) => e.user)
  leaderboardEntries: LeaderboardEntry[];
}
