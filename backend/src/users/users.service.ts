import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
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
      this.userRepo.create({ googleId, email, displayName, passwordHash: null, mustChangePassword: false }),
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
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updatePasswordHash(id: string, hash: string): Promise<void> {
    await this.userRepo.update(id, { passwordHash: hash, mustChangePassword: false });
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
