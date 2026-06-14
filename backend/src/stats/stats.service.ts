import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Match, MatchStatus } from '../matches/entities/match.entity';
import { LeaderboardEntry } from '../leaderboard/entities/leaderboard-entry.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Prediction) private predRepo: Repository<Prediction>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(LeaderboardEntry) private entryRepo: Repository<LeaderboardEntry>,
  ) {}

  async getStats(tournamentId: string) {
    const submissionCounts = await this.predRepo
      .createQueryBuilder('p')
      .innerJoin('p.match', 'm')
      .where('m.tournamentId = :tournamentId', { tournamentId })
      .select('p.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.userId')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    const topExact = await this.entryRepo.findOne({
      where: { tournamentId },
      order: { fullCount: 'DESC' },
      relations: ['user'],
    });

    const completedCount = await this.matchRepo.count({
      where: { tournamentId, status: MatchStatus.COMPLETED },
    });

    const totalPredictions = await this.predRepo
      .createQueryBuilder('p')
      .innerJoin('p.match', 'm')
      .where('m.tournamentId = :tournamentId', { tournamentId })
      .getCount();

    const avgPerMatch = completedCount > 0
      ? Math.round(totalPredictions / completedCount)
      : 0;

    return {
      mostExactScores: topExact
        ? { user: topExact.user, fullCount: topExact.fullCount }
        : null,
      mostPredictions: submissionCounts || null,
      completedMatches: completedCount,
      totalPredictions,
      avgPredictionsPerMatch: avgPerMatch,
    };
  }
}
