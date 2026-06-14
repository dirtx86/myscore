"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scoring_service_1 = require("./scoring.service");
describe('ScoringService.computePoints', () => {
    let service;
    const rules = { totoPts: 1, fullScorePts: 3, goalDiffPts: 1 };
    beforeEach(() => { service = new scoring_service_1.ScoringService(); });
    it('returns 0 for wrong result (home pred, away wins)', () => {
        expect(service.computePoints([1, 0], [0, 1], rules)).toBe(0);
    });
    it('returns 0 for predicted draw but home wins', () => {
        expect(service.computePoints([1, 1], [2, 0], rules)).toBe(0);
    });
    it('returns 0 for predicted home win but away wins', () => {
        expect(service.computePoints([2, 1], [0, 2], rules)).toBe(0);
    });
    it('returns toto only for correct winner, different goal diff', () => {
        expect(service.computePoints([2, 0], [3, 0], rules)).toBe(1);
    });
    it('returns toto only for correct winner, different goal diff (narrow)', () => {
        expect(service.computePoints([1, 0], [3, 0], rules)).toBe(1);
    });
    it('returns toto + goal diff bonus: correct home win, same goal diff, not exact', () => {
        expect(service.computePoints([3, 1], [2, 0], rules)).toBe(2);
    });
    it('returns toto + goal diff bonus: correct away win, same goal diff', () => {
        expect(service.computePoints([1, 3], [0, 2], rules)).toBe(2);
    });
    it('returns toto + full score for exact home win', () => {
        expect(service.computePoints([2, 0], [2, 0], rules)).toBe(4);
    });
    it('returns toto + full score for exact draw', () => {
        expect(service.computePoints([1, 1], [1, 1], rules)).toBe(4);
    });
    it('returns toto + full score for exact 0-0 draw', () => {
        expect(service.computePoints([0, 0], [0, 0], rules)).toBe(4);
    });
    it('returns toto only for correct draw (different scores, same result)', () => {
        expect(service.computePoints([1, 1], [0, 0], rules)).toBe(1);
    });
    it('no goal diff bonus for 0-0 draws even though both diff is 0', () => {
        expect(service.computePoints([2, 2], [0, 0], rules)).toBe(1);
    });
    it('uses custom rule values correctly', () => {
        const customRules = { totoPts: 2, fullScorePts: 5, goalDiffPts: 2 };
        expect(service.computePoints([1, 0], [1, 0], customRules)).toBe(7);
        expect(service.computePoints([3, 1], [2, 0], customRules)).toBe(4);
    });
    it('handles 0-0 vs 0-1 correctly (wrong result)', () => {
        expect(service.computePoints([0, 0], [0, 1], rules)).toBe(0);
    });
});
//# sourceMappingURL=scoring.service.spec.js.map