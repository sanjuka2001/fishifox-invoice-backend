import { Repository } from 'typeorm';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreateQuotationDto, UpdateQuotationDto } from './dto';
import { CustomersService } from '../customers/customers.service';
import { SettingsService } from '../settings/settings.service';
export declare class QuotationsService {
    private readonly quotationRepository;
    private readonly itemRepository;
    private readonly invoiceRepository;
    private readonly customersService;
    private readonly settingsService;
    constructor(quotationRepository: Repository<Quotation>, itemRepository: Repository<QuotationItem>, invoiceRepository: Repository<Invoice>, customersService: CustomersService, settingsService: SettingsService);
    private generateQuoteNumber;
    create(createQuotationDto: CreateQuotationDto): Promise<Quotation>;
    findAll(): Promise<Quotation[]>;
    findOne(id: string): Promise<Quotation>;
    update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<Quotation>;
    updateStatus(id: string, status: QuotationStatus): Promise<Quotation>;
    remove(id: string): Promise<void>;
}
