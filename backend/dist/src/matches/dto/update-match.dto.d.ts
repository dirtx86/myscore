import { MatchStage, MatchStatus } from '../entities/match.entity';
export declare class UpdateMatchDto {
    homeTeamId?: string;
    awayTeamId?: string;
    kickoffAt?: string;
    stage?: MatchStage;
    groupLabel?: string;
    venue?: string;
    status?: MatchStatus;
}
