import { Repository } from 'typeorm';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Match } from '../matches/entities/match.entity';
import { LeaderboardEntry } from '../leaderboard/entities/leaderboard-entry.entity';
export declare class StatsService {
    private predRepo;
    private matchRepo;
    private entryRepo;
    constructor(predRepo: Repository<Prediction>, matchRepo: Repository<Match>, entryRepo: Repository<LeaderboardEntry>);
    getStats(tournamentId: string): Promise<{
        mostExactScores: {
            user: import("../users/entities/user.entity").User;
            fullCount: number;
        } | null;
        mostPredictions: any;
        completedMatches: number;
        totalPredictions: number;
        avgPredictionsPerMatch: number;
    }>;
}
