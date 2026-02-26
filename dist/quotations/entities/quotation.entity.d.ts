import { Customer } from '../../customers/entities/customer.entity';
import { QuotationItem } from './quotation-item.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Project } from '../../projects/entities/project.entity';
export declare enum QuotationCurrency {
    LKR = "LKR",
    USD = "USD"
}
export declare enum QuotationStatus {
    DRAFT = "draft",
    SENT = "sent",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Quotation {
    id: string;
    quoteNumber: string;
    customer: Customer;
    customerId: string;
    project: Project;
    projectId: string;
    attentionTo: string;
    status: QuotationStatus;
    currency: QuotationCurrency;
    total: number;
    validUntil: Date;
    taxPercentage: number;
    notes: string;
    items: QuotationItem[];
    invoice: Invoice;
    createdAt: Date;
    updatedAt: Date;
}
