import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; token: string }> {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
            plainTextPassword: registerDto.password,
        });

        await this.userRepository.save(user);

        const token = this.generateToken(user);

        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }

    async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        const token = this.generateToken(user);

        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }

    async validateUser(userId: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id: userId, isActive: true },
        });
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);

        return { message: 'Password changed successfully' };
    }

    private generateToken(user: User): string {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload);
    }
}
