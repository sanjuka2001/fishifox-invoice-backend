import { Customer } from '../../customers/entities/customer.entity';
import { ProjectDocument } from './project-document.entity';
import { ProjectVault } from './project-vault.entity';
import { ServiceReminder } from './service-reminder.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
export declare enum ProjectStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    ON_HOLD = "on_hold"
}
export declare class Project {
    id: string;
    projectId: string;
    name: string;
    description: string;
    customer: Customer;
    customerId: string;
    status: ProjectStatus;
    documents: ProjectDocument[];
    vaultItems: ProjectVault[];
    reminders: ServiceReminder[];
    tasks: Task[];
    quotations: Quotation[];
    createdAt: Date;
    updatedAt: Date;
}
