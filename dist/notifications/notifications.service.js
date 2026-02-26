"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const user_entity_1 = require("../users/entities/user.entity");
let NotificationsService = class NotificationsService {
    notificationRepository;
    userRepository;
    constructor(notificationRepository, userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    async create(createDto) {
        const notification = this.notificationRepository.create(createDto);
        return this.notificationRepository.save(notification);
    }
    async createTaskCompletedNotification(taskTitle, taskId, completedByUserId, completedByUserName) {
        const admins = await this.userRepository.find({
            where: { role: user_entity_1.UserRole.ADMIN },
        });
        for (const admin of admins) {
            const notification = this.notificationRepository.create({
                message: `Task "${taskTitle}" has been completed by ${completedByUserName}`,
                type: notification_entity_1.NotificationType.TASK_COMPLETED,
                relatedTaskId: taskId,
                completedByUserId,
                forUserId: admin.id,
                isRead: false,
            });
            await this.notificationRepository.save(notification);
        }
    }
    async findAllForUser(userId) {
        return this.notificationRepository.find({
            where: { forUserId: userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { forUserId: userId, isRead: false },
        });
    }
    async markAsRead(id) {
        const notification = await this.notificationRepository.findOne({
            where: { id },
        });
        if (notification) {
            notification.isRead = true;
            return this.notificationRepository.save(notification);
        }
        return null;
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ forUserId: userId, isRead: false }, { isRead: true });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map