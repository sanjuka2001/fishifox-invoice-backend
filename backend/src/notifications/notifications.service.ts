import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createDto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepository.create(createDto);
        return this.notificationRepository.save(notification);
    }

    async createTaskCompletedNotification(
        taskTitle: string,
        taskId: string,
        completedByUserId: string,
        completedByUserName: string,
    ): Promise<void> {
        // Find all admin users
        const admins = await this.userRepository.find({
            where: { role: UserRole.ADMIN },
        });

        // Create notification for each admin
        for (const admin of admins) {
            const notification = this.notificationRepository.create({
                message: `Task "${taskTitle}" has been completed by ${completedByUserName}`,
                type: NotificationType.TASK_COMPLETED,
                relatedTaskId: taskId,
                completedByUserId,
                forUserId: admin.id,
                isRead: false,
            });
            await this.notificationRepository.save(notification);
        }
    }

    async findAllForUser(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { forUserId: userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.notificationRepository.count({
            where: { forUserId: userId, isRead: false },
        });
    }

    async markAsRead(id: string): Promise<Notification | null> {
        const notification = await this.notificationRepository.findOne({
            where: { id },
        });
        if (notification) {
            notification.isRead = true;
            return this.notificationRepository.save(notification);
        }
        return null;
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { forUserId: userId, isRead: false },
            { isRead: true },
        );
    }
}
