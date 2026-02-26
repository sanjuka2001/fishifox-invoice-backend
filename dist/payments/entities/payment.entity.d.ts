import { Invoice } from '../../invoices/entities/invoice.entity';
export declare enum PaymentMethod {
    BANK = "bank",
    CASH = "cash",
    CARD = "card",
    OTHER = "other"
}
export declare class Payment {
    id: string;
    invoice: Invoice;
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference: string;
    paymentDate: Date;
    notes: string;
    createdAt: Date;
}
