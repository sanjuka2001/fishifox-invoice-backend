import { Task } from '../../tasks/entities/task.entity';
export declare enum UserRole {
    ADMIN = "admin",
    STAFF = "staff"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    plainTextPassword: string;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}
