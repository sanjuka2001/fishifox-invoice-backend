import {
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsEmail,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// Keep for backward compatibility
export class CustomerEmailDto {
    @IsEmail()
    email: string;

    @IsBoolean()
    @IsOptional()
    isPrimary?: boolean;
}

export class ContactPersonDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsBoolean()
    @IsOptional()
    isPrimary?: boolean;
}

export class CreateCustomerDto {
    @IsString()
    companyName: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContactPersonDto)
    contacts: ContactPersonDto[];

    // Keep for backward compatibility
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CustomerEmailDto)
    @IsOptional()
    emails?: CustomerEmailDto[];
}

