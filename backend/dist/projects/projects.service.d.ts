import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectDocument, DocumentType } from './entities/project-document.entity';
import { ProjectVault } from './entities/project-vault.entity';
import { ServiceReminder } from './entities/service-reminder.entity';
import { CreateProjectDto, UpdateProjectDto, CreateVaultItemDto, CreateServiceReminderDto } from './dto';
import { CustomersService } from '../customers/customers.service';
import { EncryptionService } from './services/encryption.service';
export declare class ProjectsService {
    private readonly projectRepository;
    private readonly documentRepository;
    private readonly vaultRepository;
    private readonly reminderRepository;
    private readonly customersService;
    private readonly encryptionService;
    constructor(projectRepository: Repository<Project>, documentRepository: Repository<ProjectDocument>, vaultRepository: Repository<ProjectVault>, reminderRepository: Repository<ServiceReminder>, customersService: CustomersService, encryptionService: EncryptionService);
    private generateProjectId;
    create(createProjectDto: CreateProjectDto): Promise<Project>;
    findAll(): Promise<Project[]>;
    findByUser(userId: string): Promise<Project[]>;
    findOne(id: string): Promise<Project>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project>;
    remove(id: string): Promise<void>;
    uploadDocument(projectId: string, file: Express.Multer.File, fileType: DocumentType): Promise<ProjectDocument>;
    getDocuments(projectId: string): Promise<ProjectDocument[]>;
    deleteDocument(documentId: string): Promise<void>;
    getDocument(documentId: string): Promise<ProjectDocument>;
    addVaultItem(createVaultItemDto: CreateVaultItemDto): Promise<ProjectVault>;
    getVaultItems(projectId: string): Promise<{
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
    addReminder(createReminderDto: CreateServiceReminderDto): Promise<ServiceReminder>;
    getReminders(projectId: string): Promise<ServiceReminder[]>;
    getUpcomingReminders(days?: number): Promise<ServiceReminder[]>;
    deleteReminder(reminderId: string): Promise<void>;
    markReminderNotified(reminderId: string): Promise<ServiceReminder>;
}
