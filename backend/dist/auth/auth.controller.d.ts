import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: Partial<import("../users/entities/user.entity").User>;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: Partial<import("../users/entities/user.entity").User>;
        token: string;
    }>;
    changePassword(req: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
