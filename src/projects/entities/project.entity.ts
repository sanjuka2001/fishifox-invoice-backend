import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { ProjectDocument } from './project-document.entity';
import { ProjectVault } from './project-vault.entity';
import { ServiceReminder } from './service-reminder.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';

export enum ProjectStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    ON_HOLD = 'on_hold',
}

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    projectId: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => Customer, (customer) => customer.projects)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id' })
    customerId: string;

    @Column({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.ACTIVE,
    })
    status: ProjectStatus;

    @OneToMany(() => ProjectDocument, (doc) => doc.project)
    documents: ProjectDocument[];

    @OneToMany(() => ProjectVault, (vault) => vault.project)
    vaultItems: ProjectVault[];

    @OneToMany(() => ServiceReminder, (reminder) => reminder.project)
    reminders: ServiceReminder[];

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];

    @OneToMany(() => Quotation, (quotation) => quotation.project)
    quotations: Quotation[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
