import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PublishResultDto } from './dto/publish-result.dto';
export declare class MatchesController {
    private matchesService;
    constructor(matchesService: MatchesService);
    findAll(tournamentId: string, group?: string, status?: string, search?: string): Promise<import("./entities/match.entity").Match[]>;
    findOne(id: string): Promise<import("./entities/match.entity").Match>;
    create(dto: CreateMatchDto): Promise<import("./entities/match.entity").Match>;
    update(id: string, dto: UpdateMatchDto): Promise<import("./entities/match.entity").Match>;
    remove(id: string): Promise<void>;
    publishResult(id: string, dto: PublishResultDto): Promise<import("./entities/match.entity").Match>;
    updateStatus(id: string, dto: UpdateMatchDto): Promise<import("./entities/match.entity").Match>;
}
