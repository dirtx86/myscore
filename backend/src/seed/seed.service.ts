import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { ScoreRule } from '../tournaments/entities/score-rule.entity';
import { Team } from '../teams/entities/team.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { WC2026_TEAMS } from './wc2026-teams.data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Tournament) private tournamentRepo: Repository<Tournament>,
    @InjectRepository(ScoreRule) private scoreRuleRepo: Repository<ScoreRule>,
    @InjectRepository(Team) private teamRepo: Repository<Team>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const existing = await this.tournamentRepo.findOne({
      where: { name: 'FIFA World Cup 2026' },
    });
    if (existing) {
      this.logger.log('Seed already applied — skipping');
      return;
    }

    this.logger.log('Running seed...');

    const tournament = await this.tournamentRepo.save(
      this.tournamentRepo.create({ name: 'FIFA World Cup 2026', year: 2026, lockMinutes: 15 }),
    );

    await this.scoreRuleRepo.save(
      this.scoreRuleRepo.create({ tournamentId: tournament.id }),
    );

    for (const t of WC2026_TEAMS) {
      await this.teamRepo.save(
        this.teamRepo.create({ ...t, tournamentId: tournament.id }),
      );
    }

    const adminExists = await this.userRepo.findOne({ where: { email: 'admin@myscore.local' } });
    if (!adminExists) {
      const hash = await bcrypt.hash('changeme123', 12);
      await this.userRepo.save(
        this.userRepo.create({
          email: 'admin@myscore.local',
          displayName: 'Admin',
          passwordHash: hash,
          role: UserRole.ADMIN,
          mustChangePassword: true,
        }),
      );
    }

    this.logger.log(`Seed complete: tournament "${tournament.id}", 48 teams, 1 admin user`);
  }
}
