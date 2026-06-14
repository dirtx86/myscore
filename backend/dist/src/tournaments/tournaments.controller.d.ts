import { TournamentsService } from './tournaments.service';
import { UpdateScoreRulesDto } from './dto/update-score-rules.dto';
export declare class TournamentsController {
    private tournamentsService;
    constructor(tournamentsService: TournamentsService);
    getActive(): Promise<import("./entities/tournament.entity").Tournament>;
    getScoreRules(id: string): Promise<import("./entities/score-rule.entity").ScoreRule>;
    updateScoreRules(id: string, dto: UpdateScoreRulesDto): Promise<import("./entities/score-rule.entity").ScoreRule>;
}
