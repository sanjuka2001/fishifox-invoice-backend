import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('invoice_items')
export class InvoiceItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Invoice, (invoice) => invoice.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'invoice_id' })
    invoice: Invoice;

    @Column({ name: 'invoice_id' })
    invoiceId: string;

    @ManyToOne(() => Service, { nullable: true })
    @JoinColumn({ name: 'service_id' })
    service: Service;

    @Column({ name: 'service_id', nullable: true })
    serviceId: string;

    @Column()
    description: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    total: number;
}
