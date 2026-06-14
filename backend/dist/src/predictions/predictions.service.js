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
exports.PredictionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const prediction_entity_1 = require("./entities/prediction.entity");
const matches_service_1 = require("../matches/matches.service");
const tournaments_service_1 = require("../tournaments/tournaments.service");
let PredictionsService = class PredictionsService {
    constructor(predRepo, matchesService, tournamentsService) {
        this.predRepo = predRepo;
        this.matchesService = matchesService;
        this.tournamentsService = tournamentsService;
    }
    async findMyPredictions(userId, tournamentId) {
        return this.predRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.match', 'm')
            .leftJoinAndSelect('m.homeTeam', 'ht')
            .leftJoinAndSelect('m.awayTeam', 'at')
            .where('p.userId = :userId', { userId })
            .andWhere('m.tournamentId = :tournamentId', { tournamentId })
            .orderBy('m.kickoffAt', 'ASC')
            .getMany();
    }
    async create(userId, dto) {
        const match = await this.matchesService.findById(dto.matchId);
        const tournament = await this.tournamentsService.findById(match.tournamentId);
        if (this.matchesService.isLocked(match, tournament.lockMinutes)) {
            throw new common_1.ForbiddenException('Predictions are locked for this match');
        }
        const existing = await this.predRepo.findOne({ where: { userId, matchId: dto.matchId } });
        if (existing)
            throw new common_1.ConflictException('Prediction already exists. Use PATCH to update.');
        return this.predRepo.save(this.predRepo.create({ userId, ...dto }));
    }
    async update(userId, predId, dto) {
        const pred = await this.predRepo.findOne({ where: { id: predId, userId } });
        if (!pred)
            throw new common_1.NotFoundException('Prediction not found');
        const match = await this.matchesService.findById(pred.matchId);
        const tournament = await this.tournamentsService.findById(match.tournamentId);
        if (this.matchesService.isLocked(match, tournament.lockMinutes)) {
            throw new common_1.ForbiddenException('Predictions are locked for this match');
        }
        Object.assign(pred, dto);
        return this.predRepo.save(pred);
    }
    async findByMatchId(matchId) {
        return this.predRepo.find({ where: { matchId } });
    }
};
exports.PredictionsService = PredictionsService;
exports.PredictionsService = PredictionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prediction_entity_1.Prediction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        matches_service_1.MatchesService,
        tournaments_service_1.TournamentsService])
], PredictionsService);
//# sourceMappingURL=predictions.service.js.map