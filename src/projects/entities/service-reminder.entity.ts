import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum ServiceType {
    DOMAIN = 'domain',
    SSL = 'ssl',
    HOSTING = 'hosting',
    OTHER = 'other',
}

@Entity('service_reminders')
export class ServiceReminder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Project, (project) => project.reminders, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'project_id' })
    projectId: string;

    @Column()
    serviceName: string;

    @Column({
        type: 'enum',
        enum: ServiceType,
        default: ServiceType.OTHER,
    })
    serviceType: ServiceType;

    @Column({ type: 'date' })
    expiryDate: Date;

    @Column({ type: 'int', default: 7 })
    remindBeforeDays: number;

    @Column({ default: false })
    isNotified: boolean;

    @Column({ type: 'date', nullable: true })
    lastNotifiedAt: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
