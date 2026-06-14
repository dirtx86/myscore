import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Match } from '../matches/entities/match.entity';
import { LeaderboardEntry } from '../leaderboard/entities/leaderboard-entry.entity';
import { Tournament } from '../tournaments/entities/tournament.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Prediction) private predRepo: Repository<Prediction>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(LeaderboardEntry) private entryRepo: Repository<LeaderboardEntry>,
    @InjectRepository(Tournament) private tournamentRepo: Repository<Tournament>,
  ) {}

  async getStats(tournamentId?: string) {
    const tid = tournamentId || await this.resolveActiveTournamentId();
    if (!tid) {
      return { mostExact: null, mostPredictions: null, consensusByMatch: [], pointsByRound: [] };
    }

    const [mostExact, mostPredictions, consensusByMatch, pointsByRound] = await Promise.all([
      this.getMostExact(tid),
      this.getMostPredictions(tid),
      this.getConsensusByMatch(tid),
      this.getPointsByRound(tid),
    ]);

    return { mostExact, mostPredictions, consensusByMatch, pointsByRound };
  }

  private async resolveActiveTournamentId(): Promise<string | null> {
    const t = await this.tournamentRepo.findOne({ where: { isActive: true } });
    return t?.id ?? null;
  }

  private async getMostExact(tournamentId: string) {
    const entry = await this.entryRepo.findOne({
      where: { tournamentId },
      order: { fullCount: 'DESC', totalPts: 'DESC' },
      relations: ['user'],
    });
    if (!entry || entry.fullCount === 0) return null;
    return { user: entry.user, count: entry.fullCount };
  }

  private async getMostPredictions(tournamentId: string) {
    const entry = await this.entryRepo.findOne({
      where: { tournamentId },
      order: { playedCount: 'DESC', totalPts: 'DESC' },
      relations: ['user'],
    });
    if (!entry || entry.playedCount === 0) return null;
    return { user: entry.user, count: entry.playedCount };
  }

  private async getConsensusByMatch(tournamentId: string) {
    const matches = await this.matchRepo.find({
      where: { tournamentId },
      relations: ['homeTeam', 'awayTeam'],
      order: { kickoffAt: 'ASC' },
    });

    const result: Array<{ match: Match; homePercent: number; drawPercent: number; awayPercent: number }> = [];
    for (const match of matches) {
      const preds = await this.predRepo.find({ where: { matchId: match.id } });
      if (preds.length === 0) continue;
      const total = preds.length;
      const homeWins = preds.filter((p) => p.homeScore > p.awayScore).length;
      const draws = preds.filter((p) => p.homeScore === p.awayScore).length;
      const awayWins = preds.filter((p) => p.homeScore < p.awayScore).length;
      result.push({
        match,
        homePercent: (homeWins / total) * 100,
        drawPercent: (draws / total) * 100,
        awayPercent: (awayWins / total) * 100,
      });
    }
    return result;
  }

  private async getPointsByRound(tournamentId: string) {
    const rows = await this.predRepo
      .createQueryBuilder('p')
      .innerJoin('p.match', 'm')
      .where('m.tournamentId = :tournamentId', { tournamentId })
      .andWhere('p.pointsEarned IS NOT NULL')
      .select('m.stage', 'stage')
      .addSelect('AVG(p.pointsEarned)', 'avgPts')
      .groupBy('m.stage')
      .orderBy('MIN(m.kickoffAt)', 'ASC')
      .getRawMany<{ stage: string; avgPts: string }>();

    return rows.map((r) => ({ stage: r.stage, avgPts: parseFloat(r.avgPts) }));
  }
}
