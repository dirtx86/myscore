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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_entity_1 = require("../tournaments/entities/tournament.entity");
const score_rule_entity_1 = require("../tournaments/entities/score-rule.entity");
const team_entity_1 = require("../teams/entities/team.entity");
const user_entity_1 = require("../users/entities/user.entity");
const wc2026_teams_data_1 = require("./wc2026-teams.data");
const bcrypt = require("bcrypt");
let SeedService = SeedService_1 = class SeedService {
    constructor(tournamentRepo, scoreRuleRepo, teamRepo, userRepo) {
        this.tournamentRepo = tournamentRepo;
        this.scoreRuleRepo = scoreRuleRepo;
        this.teamRepo = teamRepo;
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        await this.seed();
    }
    async seed() {
        const existing = await this.tournamentRepo.findOne({
            where: { name: 'FIFA World Cup 2026' },
        });
        if (existing) {
            this.logger.log('Seed already applied — skipping');
            return;
        }
        this.logger.log('Running seed...');
        const tournament = await this.tournamentRepo.save(this.tournamentRepo.create({ name: 'FIFA World Cup 2026', year: 2026, lockMinutes: 15 }));
        await this.scoreRuleRepo.save(this.scoreRuleRepo.create({ tournamentId: tournament.id }));
        for (const t of wc2026_teams_data_1.WC2026_TEAMS) {
            await this.teamRepo.save(this.teamRepo.create({ ...t, tournamentId: tournament.id }));
        }
        const adminExists = await this.userRepo.findOne({ where: { email: 'admin@myscore.local' } });
        if (!adminExists) {
            const hash = await bcrypt.hash('changeme123', 12);
            await this.userRepo.save(this.userRepo.create({
                email: 'admin@myscore.local',
                displayName: 'Admin',
                passwordHash: hash,
                role: user_entity_1.UserRole.ADMIN,
                mustChangePassword: true,
            }));
        }
        this.logger.log(`Seed complete: tournament "${tournament.id}", 48 teams, 1 admin user`);
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __param(1, (0, typeorm_1.InjectRepository)(score_rule_entity_1.ScoreRule)),
    __param(2, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map