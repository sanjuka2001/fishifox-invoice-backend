import { Quotation } from './quotation.entity';
import { Service } from '../../services/entities/service.entity';
export declare class QuotationItem {
    id: string;
    quotation: Quotation;
    quotationId: string;
    service: Service;
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
