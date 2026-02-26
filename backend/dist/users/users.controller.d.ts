import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Partial<import("./entities/user.entity").User>[]>;
    findOne(id: string): Promise<Partial<import("./entities/user.entity").User>>;
    remove(id: string): Promise<void>;
}
