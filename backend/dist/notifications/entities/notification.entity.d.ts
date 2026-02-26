import { User } from '../../users/entities/user.entity';
export declare enum NotificationType {
    TASK_COMPLETED = "task_completed",
    GENERAL = "general"
}
export declare class Notification {
    id: string;
    message: string;
    type: NotificationType;
    relatedTaskId?: string;
    completedByUserId?: string;
    forUser?: User;
    forUserId?: string;
    isRead: boolean;
    createdAt: Date;
}
