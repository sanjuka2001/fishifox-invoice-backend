import {
    Controller,
    Get,
    Patch,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all notifications for the current user' })
    async findAll(@Request() req: any) {
        return this.notificationsService.findAllForUser(req.user.id);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    async getUnreadCount(@Request() req: any) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    async markAsRead(@Param('id', ParseUUIDPipe) id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@Request() req: any) {
        await this.notificationsService.markAllAsRead(req.user.id);
        return { success: true };
    }
}

