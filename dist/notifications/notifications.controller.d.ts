import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<import("./entities/notification.entity").Notification | null>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
    }>;
}
