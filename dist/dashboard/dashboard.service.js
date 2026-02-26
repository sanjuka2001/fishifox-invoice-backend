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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const service_reminder_entity_1 = require("../projects/entities/service-reminder.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
let DashboardService = class DashboardService {
    invoiceRepository;
    paymentRepository;
    reminderRepository;
    taskRepository;
    constructor(invoiceRepository, paymentRepository, reminderRepository, taskRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.reminderRepository = reminderRepository;
        this.taskRepository = taskRepository;
    }
    getDateRange(period) {
        const now = new Date();
        let startDate;
        let endDate = new Date(now);
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
    async getIncomeStats(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const payments = await this.paymentRepository.find({
            where: {
                paymentDate: (0, typeorm_2.Between)(startDate, endDate),
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
    async getExpenseStats(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const tasks = await this.taskRepository.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
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
    async getInvoiceStats(startDate, endDate, currency) {
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');
        const countQuery = (status) => {
            const q = this.invoiceRepository.createQueryBuilder('invoice');
            if (startDate && endDate) {
                q.where('invoice.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
            }
            if (currency) {
                if (startDate && endDate) {
                    q.andWhere('invoice.currency = :currency', { currency });
                }
                else {
                    q.where('invoice.currency = :currency', { currency });
                }
            }
            if (status) {
                if ((startDate && endDate) || currency) {
                    q.andWhere('invoice.status = :status', { status });
                }
                else {
                    q.where('invoice.status = :status', { status });
                }
            }
            return q.getCount();
        };
        const total = await countQuery();
        const draft = await countQuery(invoice_entity_1.InvoiceStatus.DRAFT);
        const sent = await countQuery(invoice_entity_1.InvoiceStatus.SENT);
        const partial = await countQuery(invoice_entity_1.InvoiceStatus.PARTIAL);
        const paid = await countQuery(invoice_entity_1.InvoiceStatus.PAID);
        const overdue = await countQuery(invoice_entity_1.InvoiceStatus.OVERDUE);
        const sumQuery = (field, status) => {
            const q = this.invoiceRepository.createQueryBuilder('invoice')
                .select(`SUM(invoice.${field})`, 'total');
            if (startDate && endDate) {
                q.where('invoice.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
            }
            if (currency) {
                if (startDate && endDate) {
                    q.andWhere('invoice.currency = :currency', { currency });
                }
                else {
                    q.where('invoice.currency = :currency', { currency });
                }
            }
            if (status) {
                if ((startDate && endDate) || currency) {
                    q.andWhere('invoice.status = :status', { status });
                }
                else {
                    q.where('invoice.status = :status', { status });
                }
            }
            return q.getRawOne();
        };
        const sumByStatuses = async (field, statuses) => {
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
        const paidValueResult = await sumQuery('total', invoice_entity_1.InvoiceStatus.PAID);
        const outstandingResult = await sumByStatuses('total', [
            invoice_entity_1.InvoiceStatus.DRAFT,
            invoice_entity_1.InvoiceStatus.SENT,
            invoice_entity_1.InvoiceStatus.OVERDUE
        ]);
        return {
            counts: { total, draft, sent, partial, paid, overdue },
            totalValue: Number(totalValueResult?.total) || 0,
            paidValue: Number(paidValueResult?.total) || 0,
            outstandingValue: Number(outstandingResult?.total) || 0,
        };
    }
    async getUpcomingRenewals(days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const reminders = await this.reminderRepository.find({
            where: {
                expiryDate: (0, typeorm_2.LessThanOrEqual)(futureDate),
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
    async getProjectProfitability(projectId) {
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
        const result = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.amountPaid)', 'totalIncome')
            .getRawOne();
        return {
            totalIncome: Number(result?.totalIncome) || 0,
        };
    }
    async getTotalPayments(startDate, endDate) {
        const query = this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total');
        if (startDate && endDate) {
            query.where('payment.paymentDate BETWEEN :startDate AND :endDate', { startDate, endDate });
        }
        const result = await query.getRawOne();
        return Number(result?.total) || 0;
    }
    async getRevenueOverTime(currency) {
        const months = 12;
        const result = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
            const q = this.invoiceRepository.createQueryBuilder('invoice')
                .select('SUM(invoice.total)', 'total')
                .where('invoice.status = :status', { status: invoice_entity_1.InvoiceStatus.PAID })
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
    async getDashboardSummary(startDate, endDate, currency) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (end)
            end.setHours(23, 59, 59, 999);
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(service_reminder_entity_1.ServiceReminder)),
    __param(3, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map