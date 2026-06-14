import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(@InjectRepository(Team) private teamRepo: Repository<Team>) {}

  findAll(tournamentId: string): Promise<Team[]> {
    return this.teamRepo.find({ where: { tournamentId }, order: { groupLabel: 'ASC', name: 'ASC' } });
  }

  async findById(id: string): Promise<Team> {
    const t = await this.teamRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Team not found');
    return t;
  }

  create(tournamentId: string, dto: CreateTeamDto): Promise<Team> {
    return this.teamRepo.save(this.teamRepo.create({ ...dto, tournamentId }));
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.findById(id);
    Object.assign(team, dto);
    return this.teamRepo.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findById(id);
    await this.teamRepo.remove(team);
  }
}
