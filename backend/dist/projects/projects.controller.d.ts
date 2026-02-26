import type { Response } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, CreateVaultItemDto, CreateServiceReminderDto } from './dto';
import { DocumentType } from './entities/project-document.entity';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto): Promise<import("./entities/project.entity").Project>;
    findAll(): Promise<import("./entities/project.entity").Project[]>;
    getMyProjects(userId: string): Promise<import("./entities/project.entity").Project[]>;
    getUpcomingReminders(days?: number): Promise<import("./entities/service-reminder.entity").ServiceReminder[]>;
    findOne(id: string): Promise<import("./entities/project.entity").Project>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<import("./entities/project.entity").Project>;
    remove(id: string): Promise<void>;
    uploadDocument(id: string, file: Express.Multer.File, fileType: DocumentType): Promise<import("./entities/project-document.entity").ProjectDocument>;
    getDocuments(id: string): Promise<import("./entities/project-document.entity").ProjectDocument[]>;
    downloadDocument(documentId: string, res: Response): Promise<void>;
    deleteDocument(documentId: string): Promise<void>;
    addVaultItem(id: string, createVaultItemDto: Omit<CreateVaultItemDto, 'projectId'>): Promise<import("./entities/project-vault.entity").ProjectVault>;
    getVaultItems(id: string): Promise<{
        id: string;
        label: string;
        notes: string;
        createdAt: Date;
    }[]>;
    getVaultItemDecrypted(vaultId: string): Promise<{
        label: string;
        data: string;
        notes: string;
    }>;
    deleteVaultItem(vaultId: string): Promise<void>;
    addReminder(id: string, createReminderDto: Omit<CreateServiceReminderDto, 'projectId'>): Promise<import("./entities/service-reminder.entity").ServiceReminder>;
    getReminders(id: string): Promise<import("./entities/service-reminder.entity").ServiceReminder[]>;
    deleteReminder(reminderId: string): Promise<void>;
}
