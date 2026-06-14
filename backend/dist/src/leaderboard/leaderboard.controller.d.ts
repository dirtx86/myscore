import { LeaderboardService } from './leaderboard.service';
export declare class LeaderboardController {
    private leaderboardService;
    constructor(leaderboardService: LeaderboardService);
    getLeaderboard(tournamentId: string): Promise<import("./entities/leaderboard-entry.entity").LeaderboardEntry[]>;
}
