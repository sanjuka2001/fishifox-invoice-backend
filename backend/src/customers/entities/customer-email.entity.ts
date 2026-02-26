import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('customer_emails')
export class CustomerEmail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({ default: false })
    isPrimary: boolean;

    @ManyToOne(() => Customer, (customer) => customer.emails, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id' })
    customerId: string;
}
