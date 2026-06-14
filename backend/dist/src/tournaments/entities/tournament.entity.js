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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tournament = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("../../teams/entities/team.entity");
const match_entity_1 = require("../../matches/entities/match.entity");
const score_rule_entity_1 = require("./score-rule.entity");
const leaderboard_entry_entity_1 = require("../../leaderboard/entities/leaderboard-entry.entity");
let Tournament = class Tournament {
};
exports.Tournament = Tournament;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tournament.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tournament.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Tournament.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Tournament.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 15 }),
    __metadata("design:type", Number)
], Tournament.prototype, "lockMinutes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_entity_1.Team, (t) => t.tournament),
    __metadata("design:type", Array)
], Tournament.prototype, "teams", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_entity_1.Match, (m) => m.tournament),
    __metadata("design:type", Array)
], Tournament.prototype, "matches", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => score_rule_entity_1.ScoreRule, (sr) => sr.tournament),
    __metadata("design:type", score_rule_entity_1.ScoreRule)
], Tournament.prototype, "scoreRule", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => leaderboard_entry_entity_1.LeaderboardEntry, (e) => e.tournament),
    __metadata("design:type", Array)
], Tournament.prototype, "leaderboardEntries", void 0);
exports.Tournament = Tournament = __decorate([
    (0, typeorm_1.Entity)('tournaments')
], Tournament);
//# sourceMappingURL=tournament.entity.js.map