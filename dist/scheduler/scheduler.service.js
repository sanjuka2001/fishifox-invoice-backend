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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_reminder_entity_1 = require("../projects/entities/service-reminder.entity");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
const mail_service_1 = require("../mail/mail.service");
const customers_service_1 = require("../customers/customers.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    reminderRepository;
    invoiceRepository;
    mailService;
    customersService;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(reminderRepository, invoiceRepository, mailService, customersService) {
        this.reminderRepository = reminderRepository;
        this.invoiceRepository = invoiceRepository;
        this.mailService = mailService;
        this.customersService = customersService;
    }
    async checkServiceExpirations() {
        this.logger.log('Running service expiration check...');
        const reminders = await this.reminderRepository.find({
            where: { isNotified: false },
            relations: ['project', 'project.customer'],
        });
        const today = new Date();
        for (const reminder of reminders) {
            const expiryDate = new Date(reminder.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= reminder.remindBeforeDays && daysUntilExpiry >= 0) {
                const customerEmail = await this.customersService.getPrimaryEmail(reminder.project.customerId);
                if (customerEmail) {
                    await this.mailService.sendExpirationReminder(customerEmail, reminder.project.customer.companyName, reminder.serviceName, expiryDate, reminder.project.name);
                    reminder.isNotified = true;
                    reminder.lastNotifiedAt = new Date();
                    await this.reminderRepository.save(reminder);
                    this.logger.log(`Sent expiration reminder for ${reminder.serviceName}`);
                }
            }
        }
    }
    async checkOverdueInvoices() {
        this.logger.log('Checking for overdue invoices...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueInvoices = await this.invoiceRepository.find({
            where: {
                status: invoice_entity_1.InvoiceStatus.SENT,
                dueDate: (0, typeorm_2.LessThanOrEqual)(today),
            },
        });
        for (const invoice of overdueInvoices) {
            invoice.status = invoice_entity_1.InvoiceStatus.OVERDUE;
            await this.invoiceRepository.save(invoice);
            this.logger.log(`Marked invoice ${invoice.invoiceNumber} as overdue`);
        }
    }
    async triggerExpirationCheck() {
        let checked = 0;
        let notified = 0;
        const reminders = await this.reminderRepository.find({
            where: { isNotified: false },
            relations: ['project', 'project.customer'],
        });
        const today = new Date();
        for (const reminder of reminders) {
            checked++;
            const expiryDate = new Date(reminder.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= reminder.remindBeforeDays && daysUntilExpiry >= 0) {
                const customerEmail = await this.customersService.getPrimaryEmail(reminder.project.customerId);
                if (customerEmail) {
                    await this.mailService.sendExpirationReminder(customerEmail, reminder.project.customer.companyName, reminder.serviceName, expiryDate, reminder.project.name);
                    reminder.isNotified = true;
                    reminder.lastNotifiedAt = new Date();
                    await this.reminderRepository.save(reminder);
                    notified++;
                }
            }
        }
        return { checked, notified };
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "checkServiceExpirations", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "checkOverdueInvoices", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_reminder_entity_1.ServiceReminder)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mail_service_1.MailService,
        customers_service_1.CustomersService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map