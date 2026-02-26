import { IsString, IsUUID, IsEnum, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { ServiceType } from '../entities/service-reminder.entity';

export class CreateServiceReminderDto {
    @IsUUID()
    projectId: string;

    @IsString()
    serviceName: string;

    @IsEnum(ServiceType)
    serviceType: ServiceType;

    @IsDateString()
    expiryDate: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    remindBeforeDays?: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
