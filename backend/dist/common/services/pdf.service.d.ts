import { Quotation } from '../../quotations/entities/quotation.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { SettingsService } from '../../settings/settings.service';
export declare class PdfService {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    private addCompanyHeader;
    generateQuotationPdf(quotation: Quotation): Promise<Buffer>;
    generateInvoicePdf(invoice: Invoice): Promise<Buffer>;
    generateCustomerPdf(customer: Customer): Promise<Buffer>;
    generatePaymentPdf(payment: any): Promise<Buffer>;
}
