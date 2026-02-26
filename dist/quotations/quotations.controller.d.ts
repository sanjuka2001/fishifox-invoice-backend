import type { Response } from 'express';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationDto } from './dto';
import { PdfService } from '../common/services/pdf.service';
import { MailService } from '../mail/mail.service';
export declare class QuotationsController {
    private readonly quotationsService;
    private readonly pdfService;
    private readonly mailService;
    constructor(quotationsService: QuotationsService, pdfService: PdfService, mailService: MailService);
    create(createQuotationDto: CreateQuotationDto): Promise<import("./entities/quotation.entity").Quotation>;
    findAll(): Promise<import("./entities/quotation.entity").Quotation[]>;
    findOne(id: string): Promise<import("./entities/quotation.entity").Quotation>;
    generatePdf(id: string, preview: string, res: Response): Promise<void>;
    update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<import("./entities/quotation.entity").Quotation>;
    approve(id: string): Promise<import("./entities/quotation.entity").Quotation>;
    send(id: string): Promise<import("./entities/quotation.entity").Quotation>;
    remove(id: string): Promise<void>;
}
