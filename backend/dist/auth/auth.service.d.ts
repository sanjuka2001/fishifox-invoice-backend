import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: Partial<User>;
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: Partial<User>;
        token: string;
    }>;
    validateUser(userId: string): Promise<User | null>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateToken;
}
