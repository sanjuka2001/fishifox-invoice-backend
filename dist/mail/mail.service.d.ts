import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, html: string, attachments?: any[]): Promise<void>;
    sendQuotationEmail(to: string, customerName: string, quoteNumber: string, pdfBuffer: Buffer): Promise<void>;
    sendInvoiceEmail(to: string, customerName: string, invoiceNumber: string, pdfBuffer: Buffer): Promise<void>;
    sendExpirationReminder(to: string, customerName: string, serviceName: string, expiryDate: Date, projectName: string): Promise<void>;
}
