import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    create(data: {
        email: string;
        displayName: string;
        passwordHash: string;
        role?: UserRole;
        mustChangePassword?: boolean;
    }): Promise<User>;
    updatePasswordHash(id: string, hash: string): Promise<void>;
    setActive(id: string, isActive: boolean): Promise<void>;
    forceResetPassword(id: string): Promise<{
        password: string;
    }>;
}
