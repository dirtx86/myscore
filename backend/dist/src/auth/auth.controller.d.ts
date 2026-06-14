import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            mustChangePassword: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            mustChangePassword: boolean;
        };
    }>;
    generatePassword(dto: GeneratePasswordDto): Promise<{
        message: string;
        password?: undefined;
    } | {
        password: string;
        message: string;
    }>;
    changePassword(user: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
