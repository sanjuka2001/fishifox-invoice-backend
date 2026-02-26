import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { CustomersService } from '../customers/customers.service';
import { QuotationsService } from '../quotations/quotations.service';
import { SettingsService } from '../settings/settings.service';
export declare class InvoicesService {
    private readonly invoiceRepository;
    private readonly itemRepository;
    private readonly customersService;
    private readonly quotationsService;
    private readonly settingsService;
    constructor(invoiceRepository: Repository<Invoice>, itemRepository: Repository<InvoiceItem>, customersService: CustomersService, quotationsService: QuotationsService, settingsService: SettingsService);
    private generateInvoiceNumber;
    private calculateNextInvoiceDate;
    create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    createFromQuotation(quotationId: string): Promise<Invoice>;
    findAll(): Promise<Invoice[]>;
    findOne(id: string): Promise<Invoice>;
    findUpcoming(days?: number): Promise<Invoice[]>;
    generateRecurringInvoice(parentInvoiceId: string): Promise<Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice>;
    updateStatus(id: string, status: InvoiceStatus): Promise<Invoice>;
    addPayment(id: string, amount: number): Promise<Invoice>;
    remove(id: string): Promise<void>;
}
