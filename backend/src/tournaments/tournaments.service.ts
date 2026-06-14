import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { ScoreRule } from './entities/score-rule.entity';
import { UpdateScoreRulesDto } from './dto/update-score-rules.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament) private tournamentRepo: Repository<Tournament>,
    @InjectRepository(ScoreRule) private scoreRuleRepo: Repository<ScoreRule>,
  ) {}

  async findActive(): Promise<Tournament> {
    const t = await this.tournamentRepo.findOne({ where: { isActive: true } });
    if (!t) throw new NotFoundException('No active tournament');
    return t;
  }

  async findById(id: string): Promise<Tournament> {
    const t = await this.tournamentRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Tournament not found');
    return t;
  }

  async getScoreRules(tournamentId: string): Promise<ScoreRule> {
    const rule = await this.scoreRuleRepo.findOne({ where: { tournamentId } });
    if (!rule) throw new NotFoundException('Score rules not found');
    return rule;
  }

  async updateScoreRules(tournamentId: string, dto: UpdateScoreRulesDto): Promise<ScoreRule> {
    const rule = await this.scoreRuleRepo.findOne({ where: { tournamentId } });
    if (!rule) throw new NotFoundException('Score rules not found');
    Object.assign(rule, dto);
    const saved = await this.scoreRuleRepo.save(rule);
    if (dto.lockMinutes !== undefined) {
      await this.tournamentRepo.update(tournamentId, { lockMinutes: dto.lockMinutes });
    }
    return saved;
  }

  async createWithScoreRule(data: { name: string; year: number }): Promise<Tournament> {
    const tournament = this.tournamentRepo.create(data);
    const saved = await this.tournamentRepo.save(tournament);
    const rule = this.scoreRuleRepo.create({ tournamentId: saved.id });
    await this.scoreRuleRepo.save(rule);
    return saved;
  }
}
