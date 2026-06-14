import { Tournament } from './tournament.entity';
export declare class ScoreRule {
    id: string;
    tournament: Tournament;
    tournamentId: string;
    totoPts: number;
    fullScorePts: number;
    goalDiffPts: number;
}
