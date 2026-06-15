import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
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

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @Column()
  displayName: string;

  @Column({ type: 'varchar', nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true })
  department: string | null;

  @Column({ type: 'uuid', nullable: true })
  favouriteTeamId: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarPath: string | null;

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
