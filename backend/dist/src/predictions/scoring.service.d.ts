export interface ScoreRuleValues {
    totoPts: number;
    fullScorePts: number;
    goalDiffPts: number;
}
export declare class ScoringService {
    computePoints(pred: [number, number], result: [number, number], rules: ScoreRuleValues): number;
}
