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
exports.UpdateMatchDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const match_entity_1 = require("../entities/match.entity");
class UpdateMatchDto {
}
exports.UpdateMatchDto = UpdateMatchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchDto.prototype, "homeTeamId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchDto.prototype, "awayTeamId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchDto.prototype, "kickoffAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: match_entity_1.MatchStage }),
    (0, class_validator_1.IsEnum)(match_entity_1.MatchStage),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchDto.prototype, "groupLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchDto.prototype, "venue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: match_entity_1.MatchStatus }),
    (0, class_validator_1.IsEnum)(match_entity_1.MatchStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMatchDto.prototype, "status", void 0);
//# sourceMappingURL=update-match.dto.js.map