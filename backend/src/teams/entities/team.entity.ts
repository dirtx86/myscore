import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tournament, (t) => t.teams)
  @JoinColumn()
  tournament: Tournament;

  @Column()
  tournamentId: string;

  @Column()
  name: string;

  @Column({ length: 3 })
  fifaCode: string;

  @Column({ length: 6 })
  isoCode: string;

  @Column({ nullable: true, length: 1 })
  groupLabel: string;
}
