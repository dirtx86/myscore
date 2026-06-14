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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async findById(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    async findAll() {
        return this.userRepo.find({ order: { createdAt: 'ASC' } });
    }
    async create(data) {
        const existing = await this.findByEmail(data.email);
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    async updatePasswordHash(id, hash) {
        await this.userRepo.update(id, { passwordHash: hash, mustChangePassword: false });
    }
    async setActive(id, isActive) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.userRepo.update(id, { isActive });
    }
    async forceResetPassword(id) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const newPassword = Math.random().toString(36).slice(-10) + 'A1!';
        const hash = await bcrypt.hash(newPassword, 12);
        await this.userRepo.update(id, { passwordHash: hash, mustChangePassword: true });
        return { password: newPassword };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map