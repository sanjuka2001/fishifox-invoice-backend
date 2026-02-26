import { IsNumber, IsEnum, IsOptional, IsString, IsDateString, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
    @IsUUID()
    invoiceId: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsEnum(PaymentMethod)
    @IsOptional()
    method?: PaymentMethod;

    @IsString()
    @IsOptional()
    reference?: string;

    @IsDateString()
    paymentDate: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
