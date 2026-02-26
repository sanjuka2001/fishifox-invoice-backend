import { Controller, Get, Query, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    @ApiOperation({ summary: 'Get dashboard summary' })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    @ApiQuery({ name: 'currency', required: false })
    getSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('currency') currency?: string,
    ) {
        return this.dashboardService.getDashboardSummary(startDate, endDate, currency);
    }

    @Get('income')
    @ApiOperation({ summary: 'Get income statistics' })
    @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
    getIncomeStats(@Query('period') period?: string) {
        return this.dashboardService.getIncomeStats(period);
    }

    @Get('expenses')
    @ApiOperation({ summary: 'Get expense statistics' })
    @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
    getExpenseStats(@Query('period') period?: string) {
        return this.dashboardService.getExpenseStats(period);
    }

    @Get('invoices')
    @ApiOperation({ summary: 'Get invoice statistics' })
    getInvoiceStats() {
        return this.dashboardService.getInvoiceStats();
    }

    @Get('renewals')
    @ApiOperation({ summary: 'Get upcoming renewals' })
    @ApiQuery({ name: 'days', required: false, type: Number })
    getUpcomingRenewals(@Query('days') days?: number) {
        return this.dashboardService.getUpcomingRenewals(days);
    }

    @Get('project/:projectId/profitability')
    @ApiOperation({ summary: 'Get project profitability' })
    getProjectProfitability(@Param('projectId', ParseUUIDPipe) projectId: string) {
        return this.dashboardService.getProjectProfitability(projectId);
    }
}
