import {
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsNumber,
    IsUUID,
    IsDateString,
    IsBoolean,
    IsEnum,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceFrequency } from '../entities/invoice.entity';

export class InvoiceItemDto {
    @IsUUID()
    @IsOptional()
    serviceId?: string;

    @IsString()
    description: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    unitPrice: number;
}

export class CreateInvoiceDto {
    @IsUUID()
    customerId: string;

    @IsUUID()
    @IsOptional()
    quotationId?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;

    @IsEnum(InvoiceFrequency)
    @IsOptional()
    frequency?: InvoiceFrequency;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];
}
