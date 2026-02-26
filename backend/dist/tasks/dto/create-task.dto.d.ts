import { TaskStatus } from '../entities/task.entity';
export declare class CreateTaskDto {
    projectId: string;
    assignedToId?: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    cost?: number;
    dueDate?: string;
    priority?: number;
}
