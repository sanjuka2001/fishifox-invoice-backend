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
import { Quotation } from '../../quotations/entities/quotation.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum InvoiceCurrency {
    LKR = 'LKR',
    USD = 'USD',
}

export enum InvoiceStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    PARTIAL = 'partial',
    PAID = 'paid',
    OVERDUE = 'overdue',
}

export enum InvoiceFrequency {
    NONE = 'none',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    ANNUALLY = 'annually',
}

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    invoiceNumber: string;

    @ManyToOne(() => Customer, (customer) => customer.invoices)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id' })
    customerId: string;

    @OneToOne(() => Quotation, (quotation) => quotation.invoice, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'quotation_id' })
    quotation: Quotation;

    @Column({ name: 'quotation_id', nullable: true })
    quotationId: string;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.DRAFT,
    })
    status: InvoiceStatus;

    @Column({
        type: 'enum',
        enum: InvoiceCurrency,
        default: InvoiceCurrency.LKR,
    })
    currency: InvoiceCurrency;

    @Column({ default: false })
    isRecurring: boolean;

    @Column({
        type: 'enum',
        enum: InvoiceFrequency,
        default: InvoiceFrequency.NONE,
    })
    frequency: InvoiceFrequency;

    @ManyToOne(() => Invoice, { nullable: true })
    @JoinColumn({ name: 'parent_invoice_id' })
    parentInvoice: Invoice;

    @Column({ name: 'parent_invoice_id', nullable: true })
    parentInvoiceId: string;

    @Column({ type: 'date', nullable: true })
    lastInvoiceDate: Date;

    @Column({ type: 'date', nullable: true })
    nextInvoiceDate: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    total: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    amountPaid: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    taxPercentage: number;

    @Column({ type: 'date', nullable: true })
    dueDate: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => InvoiceItem, (item) => item.invoice, {
        cascade: true,
        eager: true,
    })
    items: InvoiceItem[];

    @OneToMany(() => Payment, (payment) => payment.invoice)
    payments: Payment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
