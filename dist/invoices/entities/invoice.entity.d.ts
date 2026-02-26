import { Customer } from '../../customers/entities/customer.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
export declare enum InvoiceCurrency {
    LKR = "LKR",
    USD = "USD"
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    SENT = "sent",
    PARTIAL = "partial",
    PAID = "paid",
    OVERDUE = "overdue"
}
export declare enum InvoiceFrequency {
    NONE = "none",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    ANNUALLY = "annually"
}
export declare class Invoice {
    id: string;
    invoiceNumber: string;
    customer: Customer;
    customerId: string;
    quotation: Quotation;
    quotationId: string;
    status: InvoiceStatus;
    currency: InvoiceCurrency;
    isRecurring: boolean;
    frequency: InvoiceFrequency;
    parentInvoice: Invoice;
    parentInvoiceId: string;
    lastInvoiceDate: Date;
    nextInvoiceDate: Date;
    total: number;
    amountPaid: number;
    taxPercentage: number;
    dueDate: Date;
    notes: string;
    items: InvoiceItem[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
