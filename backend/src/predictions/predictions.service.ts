import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
  Inject, forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { MatchesService } from '../matches/matches.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { ScoringService } from './scoring.service';
import { Match, MatchStatus } from '../matches/entities/match.entity';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction) private predRepo: Repository<Prediction>,
    @Inject(forwardRef(() => MatchesService)) private matchesService: MatchesService,
    private tournamentsService: TournamentsService,
    @Inject(forwardRef(() => LeaderboardService)) private leaderboardService: LeaderboardService,
    private scoringService: ScoringService,
  ) {}

  async findMyPredictions(userId: string, tournamentId?: string): Promise<Prediction[]> {
    const tid = tournamentId || (await this.tournamentsService.findActive()).id;
    return this.predRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.match', 'm')
      .leftJoinAndSelect('m.homeTeam', 'ht')
      .leftJoinAndSelect('m.awayTeam', 'at')
      .where('p.userId = :userId', { userId })
      .andWhere('m.tournamentId = :tid', { tid })
      .orderBy('m.kickoffAt', 'ASC')
      .getMany();
  }

  async create(userId: string, dto: CreatePredictionDto): Promise<Prediction> {
    const match = await this.matchesService.findById(dto.matchId);
    const tournament = await this.tournamentsService.findById(match.tournamentId);

    if (this.matchesService.isLocked(match, tournament.lockMinutes)) {
      throw new ForbiddenException('Predictions are locked for this match');
    }

    const existing = await this.predRepo.findOne({ where: { userId, matchId: dto.matchId } });
    if (existing) throw new ConflictException('Prediction already exists. Use PATCH to update.');

    return this.predRepo.save(this.predRepo.create({ userId, ...dto }));
  }

  async update(userId: string, predId: string, dto: UpdatePredictionDto): Promise<Prediction> {
    const pred = await this.predRepo.findOne({ where: { id: predId, userId } });
    if (!pred) throw new NotFoundException('Prediction not found');

    const match = await this.matchesService.findById(pred.matchId);
    const tournament = await this.tournamentsService.findById(match.tournamentId);

    if (this.matchesService.isLocked(match, tournament.lockMinutes)) {
      throw new ForbiddenException('Predictions are locked for this match');
    }

    Object.assign(pred, dto);
    return this.predRepo.save(pred);
  }

  async findByMatchId(matchId: string): Promise<Prediction[]> {
    return this.predRepo.find({ where: { matchId } });
  }

  async adminBackfill(
    userId: string,
    matchId: string,
    homeScore: number,
    awayScore: number,
  ): Promise<Prediction> {
    const match = await this.matchesService.findById(matchId);
    const tournament = await this.tournamentsService.findById(match.tournamentId);
    const rules = await this.tournamentsService.getScoreRules(match.tournamentId);

    let pred = await this.predRepo.findOne({ where: { userId, matchId } });
    if (pred) {
      pred.homeScore = homeScore;
      pred.awayScore = awayScore;
    } else {
      pred = this.predRepo.create({ userId, matchId, homeScore, awayScore });
    }

    if (match.status === MatchStatus.COMPLETED && match.homeScore != null && match.awayScore != null) {
      pred.pointsEarned = this.scoringService.computePoints(
        [homeScore, awayScore],
        [match.homeScore, match.awayScore],
        rules,
      );
    }

    const saved = await this.predRepo.save(pred);
    await this.leaderboardService.rebuildUserEntry(userId, tournament.id, rules);
    return saved;
  }

  async findForUser(userId: string, tournamentId: string): Promise<Prediction[]> {
    return this.predRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.match', 'm')
      .leftJoinAndSelect('m.homeTeam', 'ht')
      .leftJoinAndSelect('m.awayTeam', 'at')
      .where('p.userId = :userId', { userId })
      .andWhere('m.tournamentId = :tournamentId', { tournamentId })
      .orderBy('m.kickoffAt', 'ASC')
      .getMany();
  }

  async getExactWinners(tournamentId: string) {
    const completedMatches = await this.predRepo.manager
      .getRepository(Match)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'ht')
      .leftJoinAndSelect('m.awayTeam', 'at')
      .where('m.tournamentId = :tournamentId', { tournamentId })
      .andWhere('m.status = :status', { status: MatchStatus.COMPLETED })
      .andWhere('m.homeScore IS NOT NULL')
      .orderBy('m.kickoffAt', 'DESC')
      .getMany();

    const exactPreds = await this.predRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .innerJoin('p.match', 'm')
      .where('m.tournamentId = :tournamentId', { tournamentId })
      .andWhere('m.status = :status', { status: MatchStatus.COMPLETED })
      .andWhere('p.homeScore = m.homeScore')
      .andWhere('p.awayScore = m.awayScore')
      .getMany();

    const predsByMatch = new Map<string, typeof exactPreds>();
    for (const p of exactPreds) {
      const list = predsByMatch.get(p.matchId) ?? [];
      list.push(p);
      predsByMatch.set(p.matchId, list);
    }

    return completedMatches.map((match) => ({
      matchId: match.id,
      homeTeam: match.homeTeam.fifaCode,
      awayTeam: match.awayTeam.fifaCode,
      homeTeamName: match.homeTeam.name,
      awayTeamName: match.awayTeam.name,
      kickoffAt: match.kickoffAt,
      stage: match.stage,
      actualHome: match.homeScore,
      actualAway: match.awayScore,
      winners: (predsByMatch.get(match.id) ?? []).map((p) => ({
        userId: p.userId,
        displayName: p.user.displayName,
        pointsEarned: p.pointsEarned,
      })),
    }));
  }
}
