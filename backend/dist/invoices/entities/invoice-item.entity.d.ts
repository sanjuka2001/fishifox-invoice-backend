import { Invoice } from './invoice.entity';
import { Service } from '../../services/entities/service.entity';
export declare class InvoiceItem {
    id: string;
    invoice: Invoice;
    invoiceId: string;
    service: Service;
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
