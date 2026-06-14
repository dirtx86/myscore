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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const prediction_entity_1 = require("../predictions/entities/prediction.entity");
const match_entity_1 = require("../matches/entities/match.entity");
const leaderboard_entry_entity_1 = require("../leaderboard/entities/leaderboard-entry.entity");
let StatsService = class StatsService {
    constructor(predRepo, matchRepo, entryRepo) {
        this.predRepo = predRepo;
        this.matchRepo = matchRepo;
        this.entryRepo = entryRepo;
    }
    async getStats(tournamentId) {
        const submissionCounts = await this.predRepo
            .createQueryBuilder('p')
            .innerJoin('p.match', 'm')
            .where('m.tournamentId = :tournamentId', { tournamentId })
            .select('p.userId', 'userId')
            .addSelect('COUNT(*)', 'count')
            .groupBy('p.userId')
            .orderBy('count', 'DESC')
            .limit(1)
            .getRawOne();
        const topExact = await this.entryRepo.findOne({
            where: { tournamentId },
            order: { fullCount: 'DESC' },
            relations: ['user'],
        });
        const completedCount = await this.matchRepo.count({
            where: { tournamentId, status: match_entity_1.MatchStatus.COMPLETED },
        });
        const totalPredictions = await this.predRepo
            .createQueryBuilder('p')
            .innerJoin('p.match', 'm')
            .where('m.tournamentId = :tournamentId', { tournamentId })
            .getCount();
        const avgPerMatch = completedCount > 0
            ? Math.round(totalPredictions / completedCount)
            : 0;
        return {
            mostExactScores: topExact
                ? { user: topExact.user, fullCount: topExact.fullCount }
                : null,
            mostPredictions: submissionCounts || null,
            completedMatches: completedCount,
            totalPredictions,
            avgPredictionsPerMatch: avgPerMatch,
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prediction_entity_1.Prediction)),
    __param(1, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __param(2, (0, typeorm_1.InjectRepository)(leaderboard_entry_entity_1.LeaderboardEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatsService);
//# sourceMappingURL=stats.service.js.map