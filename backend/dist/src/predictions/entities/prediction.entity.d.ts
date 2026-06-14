import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';
export declare class Prediction {
    id: string;
    user: User;
    userId: string;
    match: Match;
    matchId: string;
    homeScore: number;
    awayScore: number;
    pointsEarned: number;
    createdAt: Date;
    updatedAt: Date;
}
