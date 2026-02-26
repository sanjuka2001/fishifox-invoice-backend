import { PartialType } from '@nestjs/swagger';
import { CreateQuotationDto } from './create-quotation.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { QuotationStatus } from '../entities/quotation.entity';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
    @IsEnum(QuotationStatus)
    @IsOptional()
    status?: QuotationStatus;
}
