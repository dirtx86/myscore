import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as https from 'https';
import { Match, MatchStatus } from './entities/match.entity';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { TournamentsService } from '../tournaments/tournaments.service';

interface FdoScore {
  home: number | null;
  away: number | null;
}

interface FdoMatch {
  id: number;
  status: string;
  homeTeam: { tla: string };
  awayTeam: { tla: string };
  score: { fullTime: FdoScore };
}

@Injectable()
export class MatchSyncService implements OnModuleInit {
  private readonly logger = new Logger(MatchSyncService.name);
  private readonly apiKey = process.env.FOOTBALL_DATA_API_KEY;

  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @Inject(forwardRef(() => LeaderboardService)) private leaderboardService: LeaderboardService,
    private tournamentsService: TournamentsService,
  ) {}

  async onModuleInit() {
    if (!this.apiKey) {
      this.logger.warn('FOOTBALL_DATA_API_KEY not set — match sync disabled');
      return;
    }
    setTimeout(() => this.seedExternalIds().catch(() => {}), 5000);
  }

  private fetch<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(`https://api.football-data.org/v4${path}`);
      const req = https.get(
        { hostname: url.hostname, path: url.pathname + url.search, headers: { 'X-Auth-Token': this.apiKey } },
        (res) => {
          let raw = '';
          res.on('data', (c) => (raw += c));
          res.on('end', () => {
            if (res.statusCode !== 200) {
              reject(new Error(`football-data.org ${res.statusCode}: ${raw.slice(0, 200)}`));
            } else {
              resolve(JSON.parse(raw) as T);
            }
          });
        },
      );
      req.on('error', reject);
    });
  }

  async seedExternalIds(): Promise<void> {
    try {
      this.logger.log('Seeding externalIds from football-data.org…');
      const data = await this.fetch<{ matches: FdoMatch[] }>('/competitions/WC/matches');
      const fdoMatches = data.matches ?? [];

      const fdoMap = new Map<string, number>(
        fdoMatches.map((m) => [`${m.homeTeam.tla}:${m.awayTeam.tla}`, m.id]),
      );

      const unlinked = await this.matchRepo.find({
        where: { externalId: IsNull() },
        relations: ['homeTeam', 'awayTeam'],
      });

      let seeded = 0;
      for (const match of unlinked) {
        const key = `${match.homeTeam?.fifaCode}:${match.awayTeam?.fifaCode}`;
        const fdoId = fdoMap.get(key);
        if (fdoId !== undefined) {
          match.externalId = fdoId;
          await this.matchRepo.save(match);
          seeded++;
        }
      }

      this.logger.log(`Seeded externalId for ${seeded}/${unlinked.length} matches`);
    } catch (err) {
      this.logger.error('seedExternalIds failed', (err as Error).message);
    }
  }

  @Cron('0 * * * * *')
  async syncMatches(): Promise<void> {
    if (!this.apiKey) return;

    try {
      const data = await this.fetch<{ matches: FdoMatch[] }>('/competitions/WC/matches');
      const fdoMatches = data.matches ?? [];

      let liveCount = 0;
      let completedCount = 0;

      for (const fdoMatch of fdoMatches) {
        const result = await this.processMatch(fdoMatch);
        if (result === 'live') liveCount++;
        if (result === 'completed') completedCount++;
      }

      if (liveCount > 0 || completedCount > 0) {
        this.logger.log(`Sync tick: ${liveCount} live update(s), ${completedCount} result(s) published`);
      }
    } catch (err) {
      this.logger.error('syncMatches failed', (err as Error).message);
    }
  }

  private async processMatch(fdoMatch: FdoMatch): Promise<'live' | 'completed' | 'skip'> {
    const our = await this.matchRepo.findOne({ where: { externalId: fdoMatch.id } });
    if (!our) return 'skip';

    const { status: fdoStatus, score } = fdoMatch;
    const fullTime = score?.fullTime;

    if (fdoStatus === 'IN_PLAY' || fdoStatus === 'PAUSED') {
      if (our.status === MatchStatus.COMPLETED) return 'skip';
      const changed =
        our.status !== MatchStatus.LIVE ||
        (fullTime?.home != null && our.homeScore !== fullTime.home) ||
        (fullTime?.away != null && our.awayScore !== fullTime.away);

      if (!changed) return 'skip';

      our.status = MatchStatus.LIVE;
      if (fullTime?.home != null) our.homeScore = fullTime.home;
      if (fullTime?.away != null) our.awayScore = fullTime.away;
      await this.matchRepo.save(our);
      return 'live';
    }

    if (fdoStatus === 'FINISHED') {
      if (our.status === MatchStatus.COMPLETED) return 'skip';
      if (fullTime?.home == null || fullTime?.away == null) return 'skip';

      if (our.status === MatchStatus.SCHEDULED || our.status === MatchStatus.LOCKED) {
        our.status = MatchStatus.LIVE;
        await this.matchRepo.save(our);
      }

      our.homeScore = fullTime.home;
      our.awayScore = fullTime.away;
      our.status = MatchStatus.COMPLETED;
      await this.matchRepo.save(our);

      const rules = await this.tournamentsService.getScoreRules(our.tournamentId);
      await this.leaderboardService.recalculateForMatch(
        our.id,
        fullTime.home,
        fullTime.away,
        our.tournamentId,
        { totoPts: rules.totoPts, fullScorePts: rules.fullScorePts, goalDiffPts: rules.goalDiffPts },
      );

      this.logger.log(
        `Result: ${fdoMatch.homeTeam.tla} ${fullTime.home}–${fullTime.away} ${fdoMatch.awayTeam.tla}`,
      );
      return 'completed';
    }

    return 'skip';
  }
}
