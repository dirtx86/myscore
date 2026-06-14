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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_entity_1 = require("./entities/team.entity");
let TeamsService = class TeamsService {
    constructor(teamRepo) {
        this.teamRepo = teamRepo;
    }
    findAll(tournamentId) {
        return this.teamRepo.find({ where: { tournamentId }, order: { groupLabel: 'ASC', name: 'ASC' } });
    }
    async findById(id) {
        const t = await this.teamRepo.findOne({ where: { id } });
        if (!t)
            throw new common_1.NotFoundException('Team not found');
        return t;
    }
    create(tournamentId, dto) {
        return this.teamRepo.save(this.teamRepo.create({ ...dto, tournamentId }));
    }
    async update(id, dto) {
        const team = await this.findById(id);
        Object.assign(team, dto);
        return this.teamRepo.save(team);
    }
    async remove(id) {
        const team = await this.findById(id);
        await this.teamRepo.remove(team);
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TeamsService);
//# sourceMappingURL=teams.service.js.map