import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(startDate?: string, endDate?: string, currency?: string): Promise<{
        income: {
            period: string;
            startDate: Date;
            endDate: Date;
            totalIncome: number;
            paymentCount: number;
        };
        expenses: {
            period: string;
            startDate: Date;
            endDate: Date;
            totalExpenses: number;
            taskCount: number;
        };
        invoices: {
            counts: {
                total: number;
                draft: number;
                sent: number;
                partial: number;
                paid: number;
                overdue: number;
            };
            totalValue: number;
            paidValue: number;
            outstandingValue: number;
        };
        upcomingRenewals: {
            id: string;
            serviceName: string;
            serviceType: import("../projects/entities/service-reminder.entity").ServiceType;
            expiryDate: Date;
            projectName: string;
            customerName: string;
            isNotified: boolean;
        }[];
        totalIncome: number;
        totalPayments: number;
        revenueOverTime: {
            month: string;
            revenue: number;
        }[];
    }>;
    getIncomeStats(period?: string): Promise<{
        period: string;
        startDate: Date;
        endDate: Date;
        totalIncome: number;
        paymentCount: number;
    }>;
    getExpenseStats(period?: string): Promise<{
        period: string;
        startDate: Date;
        endDate: Date;
        totalExpenses: number;
        taskCount: number;
    }>;
    getInvoiceStats(): Promise<{
        counts: {
            total: number;
            draft: number;
            sent: number;
            partial: number;
            paid: number;
            overdue: number;
        };
        totalValue: number;
        paidValue: number;
        outstandingValue: number;
    }>;
    getUpcomingRenewals(days?: number): Promise<{
        id: string;
        serviceName: string;
        serviceType: import("../projects/entities/service-reminder.entity").ServiceType;
        expiryDate: Date;
        projectName: string;
        customerName: string;
        isNotified: boolean;
    }[]>;
    getProjectProfitability(projectId: string): Promise<{
        income: number;
        expenses: number;
        profit: number;
        profitMargin: number;
    }>;
}
