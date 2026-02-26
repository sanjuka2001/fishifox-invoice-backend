import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { PdfService } from '../common/services/pdf.service';
import { CreatePaymentDto } from './dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly pdfService;
    constructor(paymentsService: PaymentsService, pdfService: PdfService);
    create(createPaymentDto: CreatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    findAll(): Promise<import("./entities/payment.entity").Payment[]>;
    findByDateRange(startDate: string, endDate: string): Promise<import("./entities/payment.entity").Payment[]>;
    findByInvoice(invoiceId: string): Promise<import("./entities/payment.entity").Payment[]>;
    findOne(id: string): Promise<import("./entities/payment.entity").Payment>;
    generateReceiptPdf(paymentData: any, res: Response): Promise<void>;
    remove(id: string): Promise<void>;
}
