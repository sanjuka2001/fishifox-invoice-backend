import { InvoiceFrequency } from '../entities/invoice.entity';
export declare class InvoiceItemDto {
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateInvoiceDto {
    customerId: string;
    quotationId?: string;
    dueDate?: string;
    notes?: string;
    isRecurring?: boolean;
    frequency?: InvoiceFrequency;
    currency?: string;
    items: InvoiceItemDto[];
}
