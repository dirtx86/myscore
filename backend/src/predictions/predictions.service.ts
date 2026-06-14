import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { MatchesService } from '../matches/matches.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction) private predRepo: Repository<Prediction>,
    private matchesService: MatchesService,
    private tournamentsService: TournamentsService,
  ) {}

  async findMyPredictions(userId: string, tournamentId: string): Promise<Prediction[]> {
    return this.predRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.match', 'm')
      .leftJoinAndSelect('m.homeTeam', 'ht')
      .leftJoinAndSelect('m.awayTeam', 'at')
      .where('p.userId = :userId', { userId })
      .andWhere('m.tournamentId = :tournamentId', { tournamentId })
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
}
