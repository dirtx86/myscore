import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { ScoreRule } from './entities/score-rule.entity';
import { UpdateScoreRulesDto } from './dto/update-score-rules.dto';
export declare class TournamentsService {
    private tournamentRepo;
    private scoreRuleRepo;
    constructor(tournamentRepo: Repository<Tournament>, scoreRuleRepo: Repository<ScoreRule>);
    findActive(): Promise<Tournament>;
    findById(id: string): Promise<Tournament>;
    getScoreRules(tournamentId: string): Promise<ScoreRule>;
    updateScoreRules(tournamentId: string, dto: UpdateScoreRulesDto): Promise<ScoreRule>;
    createWithScoreRule(data: {
        name: string;
        year: number;
    }): Promise<Tournament>;
}
