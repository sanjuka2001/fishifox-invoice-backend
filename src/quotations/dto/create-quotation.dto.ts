import {
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsNumber,
    IsUUID,
    IsDateString,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationItemDto {
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

export class CreateQuotationDto {
    @IsUUID()
    customerId: string;

    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsDateString()
    @IsOptional()
    validUntil?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    attentionTo?: string;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuotationItemDto)
    items: QuotationItemDto[];
}
