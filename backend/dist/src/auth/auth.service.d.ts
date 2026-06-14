import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(displayName: string, email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: UserRole;
            mustChangePassword: boolean;
        };
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: UserRole;
            mustChangePassword: boolean;
        };
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    generatePassword(email: string): Promise<{
        message: string;
        password?: undefined;
    } | {
        password: string;
        message: string;
    }>;
    private signToken;
}
