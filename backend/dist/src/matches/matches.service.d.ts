import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PublishResultDto } from './dto/publish-result.dto';
export declare class MatchesService {
    private matchRepo;
    constructor(matchRepo: Repository<Match>);
    findAll(tournamentId: string, filters?: {
        group?: string;
        status?: string;
        search?: string;
    }): Promise<Match[]>;
    findById(id: string): Promise<Match>;
    create(dto: CreateMatchDto): Promise<Match>;
    update(id: string, dto: UpdateMatchDto): Promise<Match>;
    remove(id: string): Promise<void>;
    publishResult(id: string, dto: PublishResultDto): Promise<Match>;
    isLocked(match: Match, lockMinutes: number): boolean;
}
