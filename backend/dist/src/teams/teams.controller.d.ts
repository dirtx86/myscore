import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
export declare class TeamsController {
    private teamsService;
    constructor(teamsService: TeamsService);
    findAll(tournamentId: string): Promise<import("./entities/team.entity").Team[]>;
    create(dto: CreateTeamDto & {
        tournamentId: string;
    }): Promise<import("./entities/team.entity").Team>;
    update(id: string, dto: UpdateTeamDto): Promise<import("./entities/team.entity").Team>;
    remove(id: string): Promise<void>;
}
