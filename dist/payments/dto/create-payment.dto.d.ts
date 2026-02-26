import { PaymentMethod } from '../entities/payment.entity';
export declare class CreatePaymentDto {
    invoiceId: string;
    amount: number;
    method?: PaymentMethod;
    reference?: string;
    paymentDate: string;
    notes?: string;
}
