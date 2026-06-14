import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Team } from '../../teams/entities/team.entity';
export declare enum MatchStage {
    GROUP = "group",
    R32 = "r32",
    R16 = "r16",
    QF = "qf",
    SF = "sf",
    THIRD_PLACE = "third_place",
    FINAL = "final"
}
export declare enum MatchStatus {
    SCHEDULED = "scheduled",
    LOCKED = "locked",
    LIVE = "live",
    COMPLETED = "completed"
}
export declare class Match {
    id: string;
    tournament: Tournament;
    tournamentId: string;
    homeTeam: Team;
    homeTeamId: string;
    awayTeam: Team;
    awayTeamId: string;
    kickoffAt: Date;
    stage: MatchStage;
    groupLabel: string;
    venue: string;
    status: MatchStatus;
    homeScore: number;
    awayScore: number;
}
