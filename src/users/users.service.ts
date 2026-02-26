import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findAll(): Promise<Partial<User>[]> {
        const users = await this.userRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
        return users.map(({ password, ...user }) => user);
    }

    async findOne(id: string): Promise<Partial<User>> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.plainTextPassword')
            .where('user.id = :id', { id })
            .getOne();
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async deactivate(id: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        user.isActive = false;
        await this.userRepository.save(user);
    }
}
