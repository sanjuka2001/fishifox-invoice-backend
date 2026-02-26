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

@Entity('project_vault')
export class ProjectVault {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Project, (project) => project.vaultItems, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'project_id' })
    projectId: string;

    @Column()
    label: string;

    @Column({ type: 'text' })
    encryptedData: string;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
