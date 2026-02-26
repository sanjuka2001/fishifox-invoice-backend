import { Project } from './project.entity';
export declare class ProjectVault {
    id: string;
    project: Project;
    projectId: string;
    label: string;
    encryptedData: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
