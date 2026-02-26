import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum DocumentType {
    AGREEMENT = 'agreement',
    CONTRACT = 'contract',
    GENERAL = 'general',
}

@Entity('project_documents')
export class ProjectDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Project, (project) => project.documents, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'project_id' })
    projectId: string;

    @Column()
    filePath: string;

    @Column()
    fileName: string;

    @Column({ nullable: true })
    originalName: string;

    @Column({
        type: 'enum',
        enum: DocumentType,
        default: DocumentType.GENERAL,
    })
    fileType: DocumentType;

    @Column({ nullable: true })
    mimeType: string;

    @Column({ type: 'bigint', nullable: true })
    fileSize: number;

    @CreateDateColumn()
    uploadedAt: Date;
}
