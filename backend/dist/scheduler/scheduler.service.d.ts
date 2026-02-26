import { Repository } from 'typeorm';
import { ServiceReminder } from '../projects/entities/service-reminder.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { MailService } from '../mail/mail.service';
import { CustomersService } from '../customers/customers.service';
export declare class SchedulerService {
    private readonly reminderRepository;
    private readonly invoiceRepository;
    private readonly mailService;
    private readonly customersService;
    private readonly logger;
    constructor(reminderRepository: Repository<ServiceReminder>, invoiceRepository: Repository<Invoice>, mailService: MailService, customersService: CustomersService);
    checkServiceExpirations(): Promise<void>;
    checkOverdueInvoices(): Promise<void>;
    triggerExpirationCheck(): Promise<{
        checked: number;
        notified: number;
    }>;
}
