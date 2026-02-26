import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity('contact_persons')
export class ContactPerson {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ default: false })
    isPrimary: boolean;

    @ManyToOne(() => Customer, (customer) => customer.contacts, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id' })
    customerId: string;
}
