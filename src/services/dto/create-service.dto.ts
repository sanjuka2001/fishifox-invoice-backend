import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { Currency } from '../entities/service.entity';

export class CreateServiceDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    cost?: number;

    @IsEnum(Currency)
    @IsOptional()
    currency?: Currency;

    @IsString()
    @IsOptional()
    deliveryTime?: string;
}
