import { Injectable } from '@nestjs/common';

export interface ScoreRuleValues {
  totoPts: number;
  fullScorePts: number;
  goalDiffPts: number;
}

@Injectable()
export class ScoringService {
  computePoints(
    pred: [number, number],
    result: [number, number],
    rules: ScoreRuleValues,
  ): number {
    const [ph, pa] = pred;
    const [rh, ra] = result;

    const predSign = Math.sign(ph - pa);
    const resultSign = Math.sign(rh - ra);

    if (predSign !== resultSign) return 0;

    let pts = rules.totoPts;

    if (ph === rh && pa === ra) {
      pts += rules.fullScorePts;
    } else if (resultSign !== 0 && ph - pa === rh - ra) {
      pts += rules.goalDiffPts;
    }

    return pts;
  }
}
