import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PublishResultDto } from './dto/publish-result.dto';

@Injectable()
export class MatchesService {
  constructor(@InjectRepository(Match) private matchRepo: Repository<Match>) {}

  findAll(tournamentId: string, filters: { group?: string; status?: string; search?: string } = {}): Promise<Match[]> {
    const qb = this.matchRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.homeTeam', 'ht')
      .leftJoinAndSelect('m.awayTeam', 'at')
      .where('m.tournamentId = :tournamentId', { tournamentId })
      .orderBy('m.kickoffAt', 'ASC');

    if (filters.group) qb.andWhere('m.groupLabel = :group', { group: filters.group });
    if (filters.status) qb.andWhere('m.status = :status', { status: filters.status });
    if (filters.search) {
      qb.andWhere('(ht.name ILIKE :s OR at.name ILIKE :s OR ht.fifaCode ILIKE :s OR at.fifaCode ILIKE :s)',
        { s: `%${filters.search}%` });
    }
    return qb.getMany();
  }

  async findById(id: string): Promise<Match> {
    const m = await this.matchRepo.findOne({
      where: { id },
      relations: ['homeTeam', 'awayTeam', 'tournament'],
    });
    if (!m) throw new NotFoundException('Match not found');
    return m;
  }

  create(dto: CreateMatchDto): Promise<Match> {
    return this.matchRepo.save(this.matchRepo.create({ ...dto, kickoffAt: new Date(dto.kickoffAt) }));
  }

  async update(id: string, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.findById(id);
    if (dto.kickoffAt) (dto as any).kickoffAt = new Date(dto.kickoffAt);
    Object.assign(match, dto);
    return this.matchRepo.save(match);
  }

  async remove(id: string): Promise<void> {
    const match = await this.findById(id);
    await this.matchRepo.remove(match);
  }

  async publishResult(id: string, dto: PublishResultDto): Promise<Match> {
    const match = await this.findById(id);
    if (match.status === MatchStatus.SCHEDULED) {
      throw new BadRequestException('Match must be locked or live before publishing result');
    }
    match.homeScore = dto.homeScore;
    match.awayScore = dto.awayScore;
    match.status = MatchStatus.COMPLETED;
    return this.matchRepo.save(match);
  }

  isLocked(match: Match, lockMinutes: number): boolean {
    const lockAt = new Date(match.kickoffAt).getTime() - lockMinutes * 60 * 1000;
    return Date.now() >= lockAt;
  }
}
