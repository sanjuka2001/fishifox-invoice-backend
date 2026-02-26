import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { PdfService } from '../common/services/pdf.service';
import { MailService } from '../mail/mail.service';
export declare class InvoicesController {
    private readonly invoicesService;
    private readonly pdfService;
    private readonly mailService;
    constructor(invoicesService: InvoicesService, pdfService: PdfService, mailService: MailService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<import("./entities/invoice.entity").Invoice>;
    createFromQuotation(quotationId: string): Promise<import("./entities/invoice.entity").Invoice>;
    findAll(): Promise<import("./entities/invoice.entity").Invoice[]>;
    findUpcoming(days?: number): Promise<import("./entities/invoice.entity").Invoice[]>;
    findOne(id: string): Promise<import("./entities/invoice.entity").Invoice>;
    generatePdf(id: string, res: Response): Promise<void>;
    generateRecurring(id: string): Promise<import("./entities/invoice.entity").Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<import("./entities/invoice.entity").Invoice>;
    send(id: string): Promise<import("./entities/invoice.entity").Invoice>;
    remove(id: string): Promise<void>;
}
