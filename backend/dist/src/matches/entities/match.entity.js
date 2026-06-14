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
exports.Match = exports.MatchStatus = exports.MatchStage = void 0;
const typeorm_1 = require("typeorm");
const tournament_entity_1 = require("../../tournaments/entities/tournament.entity");
const team_entity_1 = require("../../teams/entities/team.entity");
var MatchStage;
(function (MatchStage) {
    MatchStage["GROUP"] = "group";
    MatchStage["R32"] = "r32";
    MatchStage["R16"] = "r16";
    MatchStage["QF"] = "qf";
    MatchStage["SF"] = "sf";
    MatchStage["THIRD_PLACE"] = "third_place";
    MatchStage["FINAL"] = "final";
})(MatchStage || (exports.MatchStage = MatchStage = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["SCHEDULED"] = "scheduled";
    MatchStatus["LOCKED"] = "locked";
    MatchStatus["LIVE"] = "live";
    MatchStatus["COMPLETED"] = "completed";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Match.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tournament_entity_1.Tournament, (t) => t.matches),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", tournament_entity_1.Tournament)
], Match.prototype, "tournament", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Match.prototype, "tournamentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "homeTeam", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Match.prototype, "homeTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "awayTeam", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Match.prototype, "awayTeamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Match.prototype, "kickoffAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MatchStage }),
    __metadata("design:type", String)
], Match.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1 }),
    __metadata("design:type", String)
], Match.prototype, "groupLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'int' }),
    __metadata("design:type", Number)
], Match.prototype, "homeScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'int' }),
    __metadata("design:type", Number)
], Match.prototype, "awayScore", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)('matches')
], Match);
//# sourceMappingURL=match.entity.js.map