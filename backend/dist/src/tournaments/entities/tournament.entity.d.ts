import { Team } from '../../teams/entities/team.entity';
import { Match } from '../../matches/entities/match.entity';
import { ScoreRule } from './score-rule.entity';
import { LeaderboardEntry } from '../../leaderboard/entities/leaderboard-entry.entity';
export declare class Tournament {
    id: string;
    name: string;
    year: number;
    isActive: boolean;
    lockMinutes: number;
    teams: Team[];
    matches: Match[];
    scoreRule: ScoreRule;
    leaderboardEntries: LeaderboardEntry[];
}
