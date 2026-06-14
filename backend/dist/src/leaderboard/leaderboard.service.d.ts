import { Repository } from 'typeorm';
import { LeaderboardEntry } from './entities/leaderboard-entry.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { ScoringService, ScoreRuleValues } from '../predictions/scoring.service';
export declare class LeaderboardService {
    private entryRepo;
    private predRepo;
    private scoringService;
    constructor(entryRepo: Repository<LeaderboardEntry>, predRepo: Repository<Prediction>, scoringService: ScoringService);
    getLeaderboard(tournamentId: string): Promise<LeaderboardEntry[]>;
    recalculateForMatch(matchId: string, homeScore: number, awayScore: number, tournamentId: string, rules: ScoreRuleValues): Promise<void>;
    private rebuildUserEntry;
}
