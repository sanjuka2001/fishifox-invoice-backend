import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Quotation } from './quotation.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('quotation_items')
export class QuotationItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Quotation, (quotation) => quotation.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'quotation_id' })
    quotation: Quotation;

    @Column({ name: 'quotation_id' })
    quotationId: string;

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
