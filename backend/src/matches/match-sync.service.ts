import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as https from 'https';
import { Match, MatchStage, MatchStatus } from './entities/match.entity';
import { Team } from '../teams/entities/team.entity';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { TournamentsService } from '../tournaments/tournaments.service';

interface FdoScore {
  home: number | null;
  away: number | null;
}

interface FdoMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  venue: string | null;
  homeTeam: { tla: string; name: string };
  awayTeam: { tla: string; name: string };
  score: { fullTime: FdoScore };
}

// TLA codes that football-data.org uses differently from our fifaCode values
const TLA_ALIASES: Record<string, string> = {
  URY: 'URU', // Uruguay
};

const STAGE_MAP: Record<string, MatchStage> = {
  GROUP_STAGE: MatchStage.GROUP,
  ROUND_OF_32: MatchStage.R32,
  ROUND_OF_16: MatchStage.R16,
  QUARTER_FINALS: MatchStage.QF,
  SEMI_FINALS: MatchStage.SF,
  THIRD_PLACE: MatchStage.THIRD_PLACE,
  FINAL: MatchStage.FINAL,
};

@Injectable()
export class MatchSyncService implements OnModuleInit {
  private readonly logger = new Logger(MatchSyncService.name);
  private readonly apiKey = process.env.FOOTBALL_DATA_API_KEY;

  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Team) private teamRepo: Repository<Team>,
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

  private fdoStatusToOurs(fdoStatus: string): MatchStatus {
    if (fdoStatus === 'FINISHED') return MatchStatus.COMPLETED;
    if (fdoStatus === 'IN_PLAY' || fdoStatus === 'PAUSED') return MatchStatus.LIVE;
    return MatchStatus.SCHEDULED;
  }

  async importMatches(tournamentId: string): Promise<{ created: number; skipped: number; updated: number; errors: string[] }> {
    if (!this.apiKey) throw new Error('FOOTBALL_DATA_API_KEY not configured');

    const data = await this.fetch<{ matches: FdoMatch[] }>('/competitions/WC/matches');
    const fdoMatches = data.matches ?? [];

    // Load all teams (not filtered by tournamentId) so TLA lookup works
    // regardless of which tournament UUID the admin passes in the request
    const teams = await this.teamRepo.find();
    const teamByTla = new Map(teams.map((t) => [t.fifaCode.toUpperCase(), t]));

    let created = 0;
    let skipped = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const fdoMatch of fdoMatches) {
      const stage = STAGE_MAP[fdoMatch.stage];
      if (!stage) { skipped++; continue; }

      const rawHome = fdoMatch.homeTeam.tla?.toUpperCase();
      const rawAway = fdoMatch.awayTeam.tla?.toUpperCase();
      if (!rawHome || !rawAway) { skipped++; continue; }

      const homeTla = TLA_ALIASES[rawHome] ?? rawHome;
      const awayTla = TLA_ALIASES[rawAway] ?? rawAway;

      const homeTeam = teamByTla.get(homeTla);
      const awayTeam = teamByTla.get(awayTla);
      if (!homeTeam || !awayTeam) {
        errors.push(`Teams not found: ${homeTla} vs ${awayTla} (stage: ${fdoMatch.stage})`);
        skipped++;
        continue;
      }

      const status = this.fdoStatusToOurs(fdoMatch.status);
      const fullTime = fdoMatch.score?.fullTime;
      const hasScore = fullTime?.home != null && fullTime?.away != null;
      const groupLabel = fdoMatch.group ? fdoMatch.group.replace('GROUP_', '').slice(0, 1) : undefined;

      const existing = await this.matchRepo.findOne({ where: { externalId: fdoMatch.id } });

      if (existing) {
        // Update status and scores for completed/live matches not yet reflected in our DB
        if (existing.status !== MatchStatus.COMPLETED && status === MatchStatus.COMPLETED && hasScore) {
          existing.status = MatchStatus.COMPLETED;
          existing.homeScore = fullTime.home!;
          existing.awayScore = fullTime.away!;
          await this.matchRepo.save(existing);
          const rules = await this.tournamentsService.getScoreRules(tournamentId);
          await this.leaderboardService.recalculateForMatch(
            existing.id, fullTime.home!, fullTime.away!, tournamentId,
            { totoPts: rules.totoPts, fullScorePts: rules.fullScorePts, goalDiffPts: rules.goalDiffPts },
          );
          updated++;
        }
        continue;
      }

      const match = this.matchRepo.create({
        tournamentId,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoffAt: new Date(fdoMatch.utcDate),
        stage,
        ...(groupLabel ? { groupLabel } : {}),
        ...(fdoMatch.venue ? { venue: fdoMatch.venue } : {}),
        externalId: fdoMatch.id,
        status,
        ...(status === MatchStatus.COMPLETED && hasScore ? { homeScore: fullTime.home!, awayScore: fullTime.away! } : {}),
        ...(status === MatchStatus.LIVE && hasScore ? { homeScore: fullTime.home!, awayScore: fullTime.away! } : {}),
      });

      const saved = await this.matchRepo.save(match);
      created++;

      // Recalculate leaderboard for any completed match imported fresh
      if (status === MatchStatus.COMPLETED && hasScore) {
        const rules = await this.tournamentsService.getScoreRules(tournamentId);
        await this.leaderboardService.recalculateForMatch(
          saved.id, fullTime.home!, fullTime.away!, tournamentId,
          { totoPts: rules.totoPts, fullScorePts: rules.fullScorePts, goalDiffPts: rules.goalDiffPts },
        );
      }
    }

    this.logger.log(`Import complete: ${created} created, ${updated} updated, ${skipped} skipped, ${errors.length} errors`);
    return { created, skipped, updated, errors };
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
