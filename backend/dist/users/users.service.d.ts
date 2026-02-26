import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): Promise<Partial<User>[]>;
    findOne(id: string): Promise<Partial<User>>;
    deactivate(id: string): Promise<void>;
}
