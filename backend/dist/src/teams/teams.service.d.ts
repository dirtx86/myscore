import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsService {
    private teamRepo;
    constructor(teamRepo: Repository<Team>);
    findAll(tournamentId: string): Promise<Team[]>;
    findById(id: string): Promise<Team>;
    create(tournamentId: string, dto: CreateTeamDto): Promise<Team>;
    update(id: string, dto: UpdateTeamDto): Promise<Team>;
    remove(id: string): Promise<void>;
}
