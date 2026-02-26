import { NotificationType } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    message: string;
    type?: NotificationType;
    relatedTaskId?: string;
    completedByUserId?: string;
    forUserId?: string;
}
