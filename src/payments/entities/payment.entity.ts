import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';

export enum PaymentMethod {
    BANK = 'bank',
    CASH = 'cash',
    CARD = 'card',
    OTHER = 'other',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Invoice, (invoice) => invoice.payments)
    @JoinColumn({ name: 'invoice_id' })
    invoice: Invoice;

    @Column({ name: 'invoice_id' })
    invoiceId: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.BANK,
    })
    method: PaymentMethod;

    @Column({ nullable: true })
    reference: string;

    @Column({ type: 'date' })
    paymentDate: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;
}
