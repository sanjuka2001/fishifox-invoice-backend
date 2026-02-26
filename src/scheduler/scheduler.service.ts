import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ServiceReminder } from '../projects/entities/service-reminder.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { MailService } from '../mail/mail.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @InjectRepository(ServiceReminder)
        private readonly reminderRepository: Repository<ServiceReminder>,
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        private readonly mailService: MailService,
        private readonly customersService: CustomersService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async checkServiceExpirations(): Promise<void> {
        this.logger.log('Running service expiration check...');

        const reminders = await this.reminderRepository.find({
            where: { isNotified: false },
            relations: ['project', 'project.customer'],
        });

        const today = new Date();

        for (const reminder of reminders) {
            const expiryDate = new Date(reminder.expiryDate);
            const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysUntilExpiry <= reminder.remindBeforeDays && daysUntilExpiry >= 0) {
                const customerEmail = await this.customersService.getPrimaryEmail(
                    reminder.project.customerId,
                );

                if (customerEmail) {
                    await this.mailService.sendExpirationReminder(
                        customerEmail,
                        reminder.project.customer.companyName,
                        reminder.serviceName,
                        expiryDate,
                        reminder.project.name,
                    );

                    reminder.isNotified = true;
                    reminder.lastNotifiedAt = new Date();
                    await this.reminderRepository.save(reminder);

                    this.logger.log(`Sent expiration reminder for ${reminder.serviceName}`);
                }
            }
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkOverdueInvoices(): Promise<void> {
        this.logger.log('Checking for overdue invoices...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueInvoices = await this.invoiceRepository.find({
            where: {
                status: InvoiceStatus.SENT,
                dueDate: LessThanOrEqual(today),
            },
        });

        for (const invoice of overdueInvoices) {
            invoice.status = InvoiceStatus.OVERDUE;
            await this.invoiceRepository.save(invoice);
            this.logger.log(`Marked invoice ${invoice.invoiceNumber} as overdue`);
        }
    }

    // Manual trigger for testing
    async triggerExpirationCheck(): Promise<{ checked: number; notified: number }> {
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
            const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysUntilExpiry <= reminder.remindBeforeDays && daysUntilExpiry >= 0) {
                const customerEmail = await this.customersService.getPrimaryEmail(
                    reminder.project.customerId,
                );

                if (customerEmail) {
                    await this.mailService.sendExpirationReminder(
                        customerEmail,
                        reminder.project.customer.companyName,
                        reminder.serviceName,
                        expiryDate,
                        reminder.project.name,
                    );

                    reminder.isNotified = true;
                    reminder.lastNotifiedAt = new Date();
                    await this.reminderRepository.save(reminder);
                    notified++;
                }
            }
        }

        return { checked, notified };
    }
}
