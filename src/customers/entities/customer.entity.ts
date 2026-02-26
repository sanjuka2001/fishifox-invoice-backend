import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { CustomerEmail } from './customer-email.entity';
import { ContactPerson } from './contact-person.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_name', default: '' })
    companyName: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => ContactPerson, (contact) => contact.customer, {
        cascade: true,
        eager: true,
    })
    contacts: ContactPerson[];

    // Keep emails for backward compatibility - can be deprecated later
    @OneToMany(() => CustomerEmail, (email) => email.customer, {
        cascade: true,
        eager: true,
    })
    emails: CustomerEmail[];

    @OneToMany(() => Quotation, (quotation) => quotation.customer)
    quotations: Quotation[];

    @OneToMany(() => Invoice, (invoice) => invoice.customer)
    invoices: Invoice[];

    @OneToMany(() => Project, (project) => project.customer)
    projects: Project[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
