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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("./entities/match.entity");
let MatchesService = class MatchesService {
    constructor(matchRepo) {
        this.matchRepo = matchRepo;
    }
    findAll(tournamentId, filters = {}) {
        const qb = this.matchRepo.createQueryBuilder('m')
            .leftJoinAndSelect('m.homeTeam', 'ht')
            .leftJoinAndSelect('m.awayTeam', 'at')
            .where('m.tournamentId = :tournamentId', { tournamentId })
            .orderBy('m.kickoffAt', 'ASC');
        if (filters.group)
            qb.andWhere('m.groupLabel = :group', { group: filters.group });
        if (filters.status)
            qb.andWhere('m.status = :status', { status: filters.status });
        if (filters.search) {
            qb.andWhere('(ht.name ILIKE :s OR at.name ILIKE :s OR ht.fifaCode ILIKE :s OR at.fifaCode ILIKE :s)', { s: `%${filters.search}%` });
        }
        return qb.getMany();
    }
    async findById(id) {
        const m = await this.matchRepo.findOne({
            where: { id },
            relations: ['homeTeam', 'awayTeam', 'tournament'],
        });
        if (!m)
            throw new common_1.NotFoundException('Match not found');
        return m;
    }
    create(dto) {
        return this.matchRepo.save(this.matchRepo.create({ ...dto, kickoffAt: new Date(dto.kickoffAt) }));
    }
    async update(id, dto) {
        const match = await this.findById(id);
        if (dto.kickoffAt)
            dto.kickoffAt = new Date(dto.kickoffAt);
        Object.assign(match, dto);
        return this.matchRepo.save(match);
    }
    async remove(id) {
        const match = await this.findById(id);
        await this.matchRepo.remove(match);
    }
    async publishResult(id, dto) {
        const match = await this.findById(id);
        if (match.status === match_entity_1.MatchStatus.SCHEDULED) {
            throw new common_1.BadRequestException('Match must be locked or live before publishing result');
        }
        match.homeScore = dto.homeScore;
        match.awayScore = dto.awayScore;
        match.status = match_entity_1.MatchStatus.COMPLETED;
        return this.matchRepo.save(match);
    }
    isLocked(match, lockMinutes) {
        const lockAt = new Date(match.kickoffAt).getTime() - lockMinutes * 60 * 1000;
        return Date.now() >= lockAt;
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MatchesService);
//# sourceMappingURL=matches.service.js.map