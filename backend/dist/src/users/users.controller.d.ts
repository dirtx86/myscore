import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(user: any): Promise<import("./entities/user.entity").User | null>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
    disable(id: string): Promise<void>;
    enable(id: string): Promise<void>;
    resetPassword(id: string): Promise<{
        password: string;
    }>;
}
