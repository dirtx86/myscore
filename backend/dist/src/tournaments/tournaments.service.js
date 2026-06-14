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
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_entity_1 = require("./entities/tournament.entity");
const score_rule_entity_1 = require("./entities/score-rule.entity");
let TournamentsService = class TournamentsService {
    constructor(tournamentRepo, scoreRuleRepo) {
        this.tournamentRepo = tournamentRepo;
        this.scoreRuleRepo = scoreRuleRepo;
    }
    async findActive() {
        const t = await this.tournamentRepo.findOne({ where: { isActive: true } });
        if (!t)
            throw new common_1.NotFoundException('No active tournament');
        return t;
    }
    async findById(id) {
        const t = await this.tournamentRepo.findOne({ where: { id } });
        if (!t)
            throw new common_1.NotFoundException('Tournament not found');
        return t;
    }
    async getScoreRules(tournamentId) {
        const rule = await this.scoreRuleRepo.findOne({ where: { tournamentId } });
        if (!rule)
            throw new common_1.NotFoundException('Score rules not found');
        return rule;
    }
    async updateScoreRules(tournamentId, dto) {
        const rule = await this.scoreRuleRepo.findOne({ where: { tournamentId } });
        if (!rule)
            throw new common_1.NotFoundException('Score rules not found');
        Object.assign(rule, dto);
        const saved = await this.scoreRuleRepo.save(rule);
        if (dto.lockMinutes !== undefined) {
            await this.tournamentRepo.update(tournamentId, { lockMinutes: dto.lockMinutes });
        }
        return saved;
    }
    async createWithScoreRule(data) {
        const tournament = this.tournamentRepo.create(data);
        const saved = await this.tournamentRepo.save(tournament);
        const rule = this.scoreRuleRepo.create({ tournamentId: saved.id });
        await this.scoreRuleRepo.save(rule);
        return saved;
    }
};
exports.TournamentsService = TournamentsService;
exports.TournamentsService = TournamentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __param(1, (0, typeorm_1.InjectRepository)(score_rule_entity_1.ScoreRule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TournamentsService);
//# sourceMappingURL=tournaments.service.js.map