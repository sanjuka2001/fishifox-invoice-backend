import { Project } from './project.entity';
export declare enum ServiceType {
    DOMAIN = "domain",
    SSL = "ssl",
    HOSTING = "hosting",
    OTHER = "other"
}
export declare class ServiceReminder {
    id: string;
    project: Project;
    projectId: string;
    serviceName: string;
    serviceType: ServiceType;
    expiryDate: Date;
    remindBeforeDays: number;
    isNotified: boolean;
    lastNotifiedAt: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
