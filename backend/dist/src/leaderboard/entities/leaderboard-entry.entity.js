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
exports.LeaderboardEntry = void 0;
const typeorm_1 = require("typeorm");
const tournament_entity_1 = require("../../tournaments/entities/tournament.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let LeaderboardEntry = class LeaderboardEntry {
};
exports.LeaderboardEntry = LeaderboardEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeaderboardEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tournament_entity_1.Tournament, (t) => t.leaderboardEntries),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", tournament_entity_1.Tournament)
], LeaderboardEntry.prototype, "tournament", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaderboardEntry.prototype, "tournamentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (u) => u.leaderboardEntries),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], LeaderboardEntry.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeaderboardEntry.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "totalPts", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "fullCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "totoCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "goalDiffCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeaderboardEntry.prototype, "playedCount", void 0);
exports.LeaderboardEntry = LeaderboardEntry = __decorate([
    (0, typeorm_1.Entity)('leaderboard_entries'),
    (0, typeorm_1.Unique)(['tournamentId', 'userId'])
], LeaderboardEntry);
//# sourceMappingURL=leaderboard-entry.entity.js.map