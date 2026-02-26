import { Repository } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ServiceReminder } from '../projects/entities/service-reminder.entity';
import { Task } from '../tasks/entities/task.entity';
export declare class DashboardService {
    private readonly invoiceRepository;
    private readonly paymentRepository;
    private readonly reminderRepository;
    private readonly taskRepository;
    constructor(invoiceRepository: Repository<Invoice>, paymentRepository: Repository<Payment>, reminderRepository: Repository<ServiceReminder>, taskRepository: Repository<Task>);
    private getDateRange;
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
    getInvoiceStats(startDate?: Date, endDate?: Date, currency?: string): Promise<{
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
    getTotalIncome(): Promise<{
        totalIncome: number;
    }>;
    getTotalPayments(startDate?: Date, endDate?: Date): Promise<number>;
    getRevenueOverTime(currency?: string): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getDashboardSummary(startDate?: string, endDate?: string, currency?: string): Promise<{
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
}
