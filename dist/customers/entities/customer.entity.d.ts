import { CustomerEmail } from './customer-email.entity';
import { ContactPerson } from './contact-person.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class Customer {
    id: string;
    companyName: string;
    address: string;
    isActive: boolean;
    contacts: ContactPerson[];
    emails: CustomerEmail[];
    quotations: Quotation[];
    invoices: Invoice[];
    projects: Project[];
    createdAt: Date;
    updatedAt: Date;
}
