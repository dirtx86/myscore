import { ScoringService } from '../predictions/scoring.service';

describe('Leaderboard recalculation counts', () => {
  const scoringService = new ScoringService();
  const rules = { totoPts: 1, fullScorePts: 3, goalDiffPts: 1 };

  it('counts full_count only for exact scores', () => {
    const preds: [number, number][] = [[2, 0], [1, 0], [3, 1], [1, 1]];
    const results: [number, number][] = [[2, 0], [3, 0], [2, 0], [1, 1]];

    let fullCount = 0, totoCount = 0, goalDiffCount = 0, totalPts = 0;
    preds.forEach((pred, i) => {
      const pts = scoringService.computePoints(pred, results[i], rules);
      totalPts += pts;
      if (pts === rules.totoPts + rules.fullScorePts) { fullCount++; totoCount++; }
      else if (pts === rules.totoPts + rules.goalDiffPts) { goalDiffCount++; totoCount++; }
      else if (pts === rules.totoPts) { totoCount++; }
    });

    expect(fullCount).toBe(2);
    expect(totoCount).toBe(4);
    expect(goalDiffCount).toBe(1);
    expect(totalPts).toBe(4 + 1 + 2 + 4); // 11
  });

  it('toto count includes exact scores', () => {
    const pts = scoringService.computePoints([2, 0], [2, 0], rules);
    expect(pts).toBe(4);
    const isToto = pts >= rules.totoPts;
    expect(isToto).toBe(true);
  });

  it('sorts leaderboard: higher pts wins, then full_count, then toto_count', () => {
    const entries = [
      { userId: 'A', totalPts: 10, fullCount: 2, totoCount: 5 },
      { userId: 'B', totalPts: 10, fullCount: 2, totoCount: 6 },
      { userId: 'C', totalPts: 10, fullCount: 3, totoCount: 5 },
      { userId: 'D', totalPts: 11, fullCount: 1, totoCount: 3 },
    ];

    const sorted = [...entries].sort((a, b) =>
      b.totalPts - a.totalPts ||
      b.fullCount - a.fullCount ||
      b.totoCount - a.totoCount
    );

    expect(sorted.map(e => e.userId)).toEqual(['D', 'C', 'B', 'A']);
  });
});
