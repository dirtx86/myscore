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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(displayName, email, password) {
        const hash = await bcrypt.hash(password, 12);
        const user = await this.usersService.create({
            email: email.toLowerCase().trim(),
            displayName,
            passwordHash: hash,
        });
        return this.signToken(user);
    }
    async login(email, password) {
        const user = await this.usersService.findByEmail(email.toLowerCase().trim());
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.signToken(user);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const hash = await bcrypt.hash(newPassword, 12);
        await this.usersService.updatePasswordHash(userId, hash);
        return { message: 'Password changed successfully' };
    }
    async generatePassword(email) {
        const user = await this.usersService.findByEmail(email.toLowerCase().trim());
        if (!user) {
            return { message: 'If this email is registered, a new password has been generated.' };
        }
        const newPassword = Math.random().toString(36).slice(-8) + 'Mc2!';
        const hash = await bcrypt.hash(newPassword, 12);
        await this.usersService.updatePasswordHash(user.id, hash);
        return { password: newPassword, message: 'Your new password is shown below. Log in and change it immediately.' };
    }
    signToken(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map