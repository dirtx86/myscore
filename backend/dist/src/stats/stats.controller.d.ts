import { StatsService } from './stats.service';
export declare class StatsController {
    private statsService;
    constructor(statsService: StatsService);
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
