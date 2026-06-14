import { Prediction } from '../../predictions/entities/prediction.entity';
import { LeaderboardEntry } from '../../leaderboard/entities/leaderboard-entry.entity';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    role: UserRole;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: Date;
    predictions: Prediction[];
    leaderboardEntries: LeaderboardEntry[];
}
