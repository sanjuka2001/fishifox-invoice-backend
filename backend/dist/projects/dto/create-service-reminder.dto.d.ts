import { ServiceType } from '../entities/service-reminder.entity';
export declare class CreateServiceReminderDto {
    projectId: string;
    serviceName: string;
    serviceType: ServiceType;
    expiryDate: string;
    remindBeforeDays?: number;
    notes?: string;
}
