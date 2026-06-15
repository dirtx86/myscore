// backend/src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly autoAdminEmails: Set<string>;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    const raw = process.env.ADMIN_EMAILS ?? '';
    this.autoAdminEmails = new Set(
      raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
    );
  }

  private roleForEmail(email: string): UserRole {
    return this.autoAdminEmails.has(email.toLowerCase()) ? UserRole.ADMIN : UserRole.USER;
  }

  private toProfile(user: User): User & { avatarUrl: string | null } {
    const avatarUrl = user.avatarPath
      ? `/uploads/${user.avatarPath}`
      : null;
    return { ...user, avatarUrl };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<(User & { avatarUrl: string | null }) | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    return this.toProfile(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { createdAt: 'ASC' } });
  }

  async findOrCreateGoogleUser(googleId: string, email: string, displayName: string): Promise<User> {
    let user = await this.userRepo.findOne({ where: { googleId } });
    if (user) return user;

    user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      user.googleId = googleId;
      return this.userRepo.save(user);
    }

    return this.userRepo.save(
      this.userRepo.create({
        googleId, email, displayName,
        passwordHash: null, mustChangePassword: false,
        role: this.roleForEmail(email),
      }),
    );
  }

  async create(data: {
    email: string;
    displayName: string;
    passwordHash: string;
    role?: UserRole;
    mustChangePassword?: boolean;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');
    const role = data.role ?? this.roleForEmail(data.email);
    const user = this.userRepo.create({ ...data, role });
    return this.userRepo.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User & { avatarUrl: string | null }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    return this.toProfile(saved);
  }

  async updateAvatar(id: string, avatarPath: string): Promise<User & { avatarUrl: string | null }> {
    await this.userRepo.update(id, { avatarPath });
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.toProfile(user);
  }

  async updatePasswordHash(id: string, hash: string): Promise<void> {
    await this.userRepo.update(id, { passwordHash: hash, mustChangePassword: false });
  }

  async setRole(id: string, role: UserRole): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(id, { role });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(id, { isActive });
  }

  async forceResetPassword(id: string): Promise<{ password: string }> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const newPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const hash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(id, { passwordHash: hash, mustChangePassword: true });
    return { password: newPassword };
  }
}
