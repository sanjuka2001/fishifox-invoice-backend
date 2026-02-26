import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
    TASK_COMPLETED = 'task_completed',
    GENERAL = 'general',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.GENERAL,
    })
    type: NotificationType;

    @Column({ name: 'related_task_id', nullable: true })
    relatedTaskId?: string;

    @Column({ name: 'completed_by_user_id', nullable: true })
    completedByUserId?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'for_user_id' })
    forUser?: User;

    @Column({ name: 'for_user_id', nullable: true })
    forUserId?: string;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
