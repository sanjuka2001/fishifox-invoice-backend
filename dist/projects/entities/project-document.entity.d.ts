import { Project } from './project.entity';
export declare enum DocumentType {
    AGREEMENT = "agreement",
    CONTRACT = "contract",
    GENERAL = "general"
}
export declare class ProjectDocument {
    id: string;
    project: Project;
    projectId: string;
    filePath: string;
    fileName: string;
    originalName: string;
    fileType: DocumentType;
    mimeType: string;
    fileSize: number;
    uploadedAt: Date;
}
