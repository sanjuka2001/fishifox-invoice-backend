import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { QuotationItem } from './quotation-item.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Project } from '../../projects/entities/project.entity';

export enum QuotationCurrency {
    LKR = 'LKR',
    USD = 'USD',
}

export enum QuotationStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('quotations')
export class Quotation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    quoteNumber: string;

    @ManyToOne(() => Customer, (customer) => customer.quotations)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id' })
    customerId: string;

    @ManyToOne(() => Project, { nullable: true })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'project_id', nullable: true })
    projectId: string;

    @Column({ nullable: true })
    attentionTo: string;

    @Column({
        type: 'enum',
        enum: QuotationStatus,
        default: QuotationStatus.DRAFT,
    })
    status: QuotationStatus;

    @Column({
        type: 'enum',
        enum: QuotationCurrency,
        default: QuotationCurrency.LKR,
    })
    currency: QuotationCurrency;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    total: number;

    @Column({ type: 'date', nullable: true })
    validUntil: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    taxPercentage: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => QuotationItem, (item) => item.quotation, {
        cascade: true,
        eager: true,
    })
    items: QuotationItem[];

    @OneToOne(() => Invoice, (invoice) => invoice.quotation)
    invoice: Invoice;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
