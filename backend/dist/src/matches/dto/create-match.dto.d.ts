import { MatchStage } from '../entities/match.entity';
export declare class CreateMatchDto {
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: string;
    stage: MatchStage;
    groupLabel?: string;
    venue?: string;
}
