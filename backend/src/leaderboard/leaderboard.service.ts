import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { ScoringService, ScoreRuleValues } from '../predictions/scoring.service';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(LeaderboardEntry) private entryRepo: Repository<LeaderboardEntry>,
    @InjectRepository(Prediction) private predRepo: Repository<Prediction>,
    @Inject(forwardRef(() => ScoringService)) private scoringService: ScoringService,
  ) {}

  async getLeaderboard(tournamentId: string): Promise<(LeaderboardEntry & { rank: number })[]> {
    const entries = await this.entryRepo.createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'u')
      .where('e.tournamentId = :tournamentId', { tournamentId })
      .orderBy('e.totalPts', 'DESC')
      .addOrderBy('e.fullCount', 'DESC')
      .addOrderBy('e.totoCount', 'DESC')
      .getMany();

    let rank = 1;
    return entries.map((e, i) => {
      if (i > 0) {
        const prev = entries[i - 1] as any;
        const sameRank =
          prev.totalPts === e.totalPts &&
          prev.fullCount === e.fullCount &&
          prev.totoCount === e.totoCount;
        if (!sameRank) rank = i + 1;
      }
      return { ...e, rank };
    });
  }

  async recalculateForMatch(
    matchId: string,
    homeScore: number,
    awayScore: number,
    tournamentId: string,
    rules: ScoreRuleValues,
  ): Promise<void> {
    const predictions = await this.predRepo.find({ where: { matchId } });

    for (const pred of predictions) {
      const pts = this.scoringService.computePoints(
        [pred.homeScore, pred.awayScore],
        [homeScore, awayScore],
        rules,
      );

      pred.pointsEarned = pts;
      await this.predRepo.save(pred);

      await this.rebuildUserEntry(pred.userId, tournamentId, rules);
    }
  }

  private async rebuildUserEntry(
    userId: string,
    tournamentId: string,
    rules: ScoreRuleValues,
  ): Promise<void> {
    const allPreds = await this.predRepo.createQueryBuilder('p')
      .innerJoin('p.match', 'm')
      .where('p.userId = :userId', { userId })
      .andWhere('m.tournamentId = :tournamentId', { tournamentId })
      .andWhere('p.pointsEarned IS NOT NULL')
      .getMany();

    let totalPts = 0, fullCount = 0, totoCount = 0, goalDiffCount = 0;
    const fullThreshold = rules.totoPts + rules.fullScorePts;
    const goalDiffThreshold = rules.totoPts + rules.goalDiffPts;

    for (const p of allPreds) {
      totalPts += p.pointsEarned;
      if (p.pointsEarned >= fullThreshold) {
        fullCount++;
        totoCount++;
      } else if (p.pointsEarned >= goalDiffThreshold && p.pointsEarned < fullThreshold) {
        goalDiffCount++;
        totoCount++;
      } else if (p.pointsEarned >= rules.totoPts) {
        totoCount++;
      }
    }

    await this.entryRepo.upsert(
      {
        tournamentId,
        userId,
        totalPts,
        fullCount,
        totoCount,
        goalDiffCount,
        playedCount: allPreds.length,
      },
      ['tournamentId', 'userId'],
    );
  }
}
