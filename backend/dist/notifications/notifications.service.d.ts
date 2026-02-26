import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto';
import { User } from '../users/entities/user.entity';
export declare class NotificationsService {
    private readonly notificationRepository;
    private readonly userRepository;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>);
    create(createDto: CreateNotificationDto): Promise<Notification>;
    createTaskCompletedNotification(taskTitle: string, taskId: string, completedByUserId: string, completedByUserName: string): Promise<void>;
    findAllForUser(userId: string): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
}
