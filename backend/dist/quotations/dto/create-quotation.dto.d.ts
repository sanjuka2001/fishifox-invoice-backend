export declare class QuotationItemDto {
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateQuotationDto {
    customerId: string;
    projectId?: string;
    validUntil?: string;
    notes?: string;
    attentionTo?: string;
    currency?: string;
    items: QuotationItemDto[];
}
