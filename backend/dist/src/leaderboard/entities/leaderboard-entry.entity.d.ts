import { Tournament } from '../../tournaments/entities/tournament.entity';
import { User } from '../../users/entities/user.entity';
export declare class LeaderboardEntry {
    id: string;
    tournament: Tournament;
    tournamentId: string;
    user: User;
    userId: string;
    totalPts: number;
    fullCount: number;
    totoCount: number;
    goalDiffCount: number;
    playedCount: number;
}
