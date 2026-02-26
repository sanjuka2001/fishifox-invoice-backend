import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ServiceReminder } from '../projects/entities/service-reminder.entity';
import { Task } from '../tasks/entities/task.entity';

interface DateRange {
    startDate: Date;
    endDate: Date;
}

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(ServiceReminder)
        private readonly reminderRepository: Repository<ServiceReminder>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    private getDateRange(period: string): DateRange {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date(now);

        switch (period) {
            case 'day':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date();
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        return { startDate, endDate };
    }

    async getIncomeStats(period: string = 'month') {
        const { startDate, endDate } = this.getDateRange(period);

        const payments = await this.paymentRepository.find({
            where: {
                paymentDate: Between(startDate, endDate),
            },
        });

        const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            period,
            startDate,
            endDate,
            totalIncome,
            paymentCount: payments.length,
        };
    }

    async getExpenseStats(period: string = 'month') {
        const { startDate, endDate } = this.getDateRange(period);

        const tasks = await this.taskRepository.find({
            where: {
                createdAt: Between(startDate, endDate),
            },
        });

        const totalExpenses = tasks.reduce((sum, t) => sum + Number(t.cost), 0);

        return {
            period,
            startDate,
            endDate,
            totalExpenses,
            taskCount: tasks.length,
        };
    }

    async getInvoiceStats(startDate?: Date, endDate?: Date, currency?: string) {
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');
        const countQuery = (status?: InvoiceStatus) => {
            const q = this.invoiceRepository.createQueryBuilder('invoice');
            if (startDate && endDate) {
                q.where('invoice.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
            }
            if (currency) {
                if (startDate && endDate) {
                    q.andWhere('invoice.currency = :currency', { currency });
                } else {
                    q.where('invoice.currency = :currency', { currency });
                }
            }
            if (status) {
                if ((startDate && endDate) || currency) {
                    q.andWhere('invoice.status = :status', { status });
                } else {
                    q.where('invoice.status = :status', { status });
                }
            }
            return q.getCount();
        };

        const total = await countQuery();
        const draft = await countQuery(InvoiceStatus.DRAFT);
        const sent = await countQuery(InvoiceStatus.SENT);
        const partial = await countQuery(InvoiceStatus.PARTIAL);
        const paid = await countQuery(InvoiceStatus.PAID);
        const overdue = await countQuery(InvoiceStatus.OVERDUE);

        const sumQuery = (field: string, status?: InvoiceStatus) => {
            const q = this.invoiceRepository.createQueryBuilder('invoice')
                .select(`SUM(invoice.${field})`, 'total');
            if (startDate && endDate) {
                q.where('invoice.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
            }
            if (currency) {
                if (startDate && endDate) {
                    q.andWhere('invoice.currency = :currency', { currency });
                } else {
                    q.where('invoice.currency = :currency', { currency });
                }
            }
            if (status) {
                if ((startDate && endDate) || currency) {
                    q.andWhere('invoice.status = :status', { status });
                } else {
                    q.where('invoice.status = :status', { status });
                }
            }
            return q.getRawOne();
        }

        const sumByStatuses = async (field: string, statuses: InvoiceStatus[]) => {
            const q = this.invoiceRepository.createQueryBuilder('invoice')
                .select(`SUM(invoice.${field})`, 'total')
                .where('invoice.status IN (:...statuses)', { statuses });
            if (startDate && endDate) {
                q.andWhere('invoice.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
            }
            if (currency) {
                q.andWhere('invoice.currency = :currency', { currency });
            }
            return q.getRawOne();
        };

        const totalValueResult = await sumQuery('total');
        // Calculate total income from invoices with PAID status
        const paidValueResult = await sumQuery('total', InvoiceStatus.PAID);
        // Calculate outstanding from draft, sent, and overdue invoices
        const outstandingResult = await sumByStatuses('total', [
            InvoiceStatus.DRAFT,
            InvoiceStatus.SENT,
            InvoiceStatus.OVERDUE
        ]);

        return {
            counts: { total, draft, sent, partial, paid, overdue },
            totalValue: Number(totalValueResult?.total) || 0,
            paidValue: Number(paidValueResult?.total) || 0,
            outstandingValue: Number(outstandingResult?.total) || 0,
        };
    }

    async getUpcomingRenewals(days: number = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const reminders = await this.reminderRepository.find({
            where: {
                expiryDate: LessThanOrEqual(futureDate),
            },
            relations: ['project', 'project.customer'],
            order: { expiryDate: 'ASC' },
            take: 10,
        });

        return reminders.map((r) => ({
            id: r.id,
            serviceName: r.serviceName,
            serviceType: r.serviceType,
            expiryDate: r.expiryDate,
            projectName: r.project?.name,
            customerName: r.project?.customer?.companyName,
            isNotified: r.isNotified,
        }));
    }

    async getProjectProfitability(projectId: string) {
        const invoices = await this.invoiceRepository.find({
            where: { customerId: projectId },
        });

        const tasks = await this.taskRepository.find({
            where: { projectId },
        });

        const income = invoices.reduce((sum, i) => sum + Number(i.amountPaid), 0);
        const expenses = tasks.reduce((sum, t) => sum + Number(t.cost), 0);

        return {
            income,
            expenses,
            profit: income - expenses,
            profitMargin: income > 0 ? ((income - expenses) / income) * 100 : 0,
        };
    }

    async getTotalIncome() {
        // Total income from all paid amounts in invoices
        const result = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.amountPaid)', 'totalIncome')
            .getRawOne();

        return {
            totalIncome: Number(result?.totalIncome) || 0,
        };
    }

    async getTotalPayments(startDate?: Date, endDate?: Date) {
        const query = this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total');

        if (startDate && endDate) {
            query.where('payment.paymentDate BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        const result = await query.getRawOne();
        return Number(result?.total) || 0;
    }

    async getRevenueOverTime(currency?: string) {
        const months = 12;
        const result: { month: string; revenue: number }[] = [];

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

            const q = this.invoiceRepository.createQueryBuilder('invoice')
                .select('SUM(invoice.total)', 'total')
                .where('invoice.status = :status', { status: InvoiceStatus.PAID })
                .andWhere('invoice.createdAt BETWEEN :start AND :end', { start: startOfMonth, end: endOfMonth });

            if (currency) {
                q.andWhere('invoice.currency = :currency', { currency });
            }

            const row = await q.getRawOne();
            const monthLabel = startOfMonth.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            result.push({ month: monthLabel, revenue: Number(row?.total) || 0 });
        }

        return result;
    }

    async getDashboardSummary(startDate?: string, endDate?: string, currency?: string) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (end) end.setHours(23, 59, 59, 999);

        const [incomeStats, expenseStats, invoiceStats, upcomingRenewals, totalPayments, revenueOverTime] = await Promise.all([
            this.getIncomeStats('month'),
            this.getExpenseStats('month'),
            this.getInvoiceStats(start, end, currency),
            this.getUpcomingRenewals(7),
            this.getTotalPayments(start, end),
            this.getRevenueOverTime(currency),
        ]);

        return {
            income: incomeStats,
            expenses: expenseStats,
            invoices: invoiceStats,
            upcomingRenewals,
            totalIncome: invoiceStats.paidValue,
            totalPayments,
            revenueOverTime,
        };
    }
}
