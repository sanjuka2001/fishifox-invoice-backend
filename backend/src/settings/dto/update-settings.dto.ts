import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSettingsDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    // Website field removed

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => value !== undefined && value !== '' ? parseFloat(value) : undefined)
    @IsNumber()
    @Min(0)
    @Max(100)
    taxPercentage?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    logoUrl?: string;
}
