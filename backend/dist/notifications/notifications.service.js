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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notificationRepository;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async sendPushNotification(user, title, body, data) {
        const notification = this.notificationRepository.create({
            user,
            title,
            body,
            data: data ? JSON.stringify(data) : undefined,
        });
        const saved = await this.notificationRepository.save(notification);
        if (user.expoPushToken) {
            await this.sendExpoNotification({
                to: user.expoPushToken,
                title,
                body,
                data,
            });
        }
        return saved;
    }
    async sendBulkPushNotifications(users, title, body, data) {
        const notifications = users.map((user) => this.notificationRepository.create({
            user,
            title,
            body,
            data: data ? JSON.stringify(data) : undefined,
        }));
        await this.notificationRepository.save(notifications);
        const messages = users
            .filter((u) => u.expoPushToken)
            .map((u) => ({
            to: u.expoPushToken,
            title,
            body,
            data,
        }));
        if (messages.length > 0) {
            await this.sendExpoBulkNotifications(messages);
        }
    }
    async getUserNotifications(userId, limit = 20, offset = 0) {
        const [notifications, total] = await this.notificationRepository.findAndCount({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { notifications, total };
    }
    async markAsRead(notificationId, userId) {
        await this.notificationRepository.update({ id: notificationId, user: { id: userId } }, { isRead: true });
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ user: { id: userId }, isRead: false }, { isRead: true });
    }
    async sendExpoNotification(message) {
        try {
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(message),
            });
            if (!response.ok) {
                this.logger.error(`Expo push failed: ${response.statusText}`);
            }
        }
        catch (error) {
            this.logger.error(`Expo push error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async sendExpoBulkNotifications(messages) {
        try {
            const batchSize = 100;
            for (let i = 0; i < messages.length; i += batchSize) {
                const batch = messages.slice(i, i + batchSize);
                const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(batch),
                });
                if (!response.ok) {
                    this.logger.error(`Expo bulk push failed: ${response.statusText}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Expo bulk push error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map