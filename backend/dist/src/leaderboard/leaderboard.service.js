"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leaderboard_entry_entity_1 = require("./entities/leaderboard-entry.entity");
const prediction_entity_1 = require("../predictions/entities/prediction.entity");
const scoring_service_1 = require("../predictions/scoring.service");
let LeaderboardService = class LeaderboardService {
    constructor(entryRepo, predRepo, scoringService) {
        this.entryRepo = entryRepo;
        this.predRepo = predRepo;
        this.scoringService = scoringService;
    }
    async getLeaderboard(tournamentId) {
        return this.entryRepo.createQueryBuilder('e')
            .leftJoinAndSelect('e.user', 'u')
            .where('e.tournamentId = :tournamentId', { tournamentId })
            .orderBy('e.totalPts', 'DESC')
            .addOrderBy('e.fullCount', 'DESC')
            .addOrderBy('e.totoCount', 'DESC')
            .getMany();
    }
    async recalculateForMatch(matchId, homeScore, awayScore, tournamentId, rules) {
        const predictions = await this.predRepo.find({ where: { matchId } });
        for (const pred of predictions) {
            const pts = this.scoringService.computePoints([pred.homeScore, pred.awayScore], [homeScore, awayScore], rules);
            pred.pointsEarned = pts;
            await this.predRepo.save(pred);
            await this.rebuildUserEntry(pred.userId, tournamentId, rules);
        }
    }
    async rebuildUserEntry(userId, tournamentId, rules) {
        const allPreds = await this.predRepo.createQueryBuilder('p')
            .innerJoin('p.match', 'm')
            .where('p.userId = :userId', { userId })
            .andWhere('m.tournamentId = :tournamentId', { tournamentId })
            .andWhere('p.pointsEarned IS NOT NULL')
            .getMany();
        let totalPts = 0, fullCount = 0, totoCount = 0, goalDiffCount = 0;
        const fullThreshold = rules.totoPts + rules.fullScorePts;
        const goalDiffThreshold = rules.totoPts + rules.goalDiffPts;
        for (const p of allPreds) {
            totalPts += p.pointsEarned;
            if (p.pointsEarned >= fullThreshold) {
                fullCount++;
                totoCount++;
            }
            else if (p.pointsEarned >= goalDiffThreshold && p.pointsEarned < fullThreshold) {
                goalDiffCount++;
                totoCount++;
            }
            else if (p.pointsEarned >= rules.totoPts) {
                totoCount++;
            }
        }
        await this.entryRepo.upsert({
            tournamentId,
            userId,
            totalPts,
            fullCount,
            totoCount,
            goalDiffCount,
            playedCount: allPreds.length,
        }, ['tournamentId', 'userId']);
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leaderboard_entry_entity_1.LeaderboardEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(prediction_entity_1.Prediction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        scoring_service_1.ScoringService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map