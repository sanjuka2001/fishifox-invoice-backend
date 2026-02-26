import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('scheduler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('scheduler')
export class SchedulerController {
    constructor(private readonly schedulerService: SchedulerService) { }

    @Post('trigger-expiration-check')
    @ApiOperation({ summary: 'Manually trigger expiration check' })
    triggerExpirationCheck() {
        return this.schedulerService.triggerExpirationCheck();
    }

    @Post('trigger-overdue-check')
    @ApiOperation({ summary: 'Manually trigger overdue invoice check' })
    triggerOverdueCheck() {
        return this.schedulerService.checkOverdueInvoices();
    }
}
