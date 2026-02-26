import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;

    @IsOptional()
    amountPaid?: number;
}
