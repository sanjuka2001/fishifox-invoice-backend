import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
export declare enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}
export declare class Task {
    id: string;
    project: Project;
    projectId: string;
    assignedTo: User;
    assignedToId?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    cost: number;
    hoursTracked: number;
    dueDate?: Date;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}
