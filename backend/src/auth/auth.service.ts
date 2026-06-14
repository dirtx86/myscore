import {
  Injectable, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(displayName: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 12);
    const user = await this.usersService.create({
      email: email.toLowerCase().trim(),
      displayName,
      passwordHash: hash,
    });
    return this.signToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase().trim());
    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.signToken(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    const hash = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePasswordHash(userId, hash);
    return { message: 'Password changed successfully' };
  }

  async generatePassword(email: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return { message: 'If this email is registered, a new password has been generated.' };
    }
    const newPassword = Math.random().toString(36).slice(-8) + 'Mc2!';
    const hash = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePasswordHash(user.id, hash);
    return { password: newPassword, message: 'Your new password is shown below. Log in and change it immediately.' };
  }

  private signToken(user: { id: string; email: string; displayName: string; role: UserRole; mustChangePassword: boolean }) {
    const payload = { sub: user.id, email: user.email, role: user.role, displayName: user.displayName };
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
}
