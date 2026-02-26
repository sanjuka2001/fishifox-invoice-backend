import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectDocument, DocumentType } from './entities/project-document.entity';
import { ProjectVault } from './entities/project-vault.entity';
import { ServiceReminder } from './entities/service-reminder.entity';
import { CreateProjectDto, UpdateProjectDto, CreateVaultItemDto, CreateServiceReminderDto } from './dto';
import { CustomersService } from '../customers/customers.service';
import { EncryptionService } from './services/encryption.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(ProjectDocument)
        private readonly documentRepository: Repository<ProjectDocument>,
        @InjectRepository(ProjectVault)
        private readonly vaultRepository: Repository<ProjectVault>,
        @InjectRepository(ServiceReminder)
        private readonly reminderRepository: Repository<ServiceReminder>,
        private readonly customersService: CustomersService,
        private readonly encryptionService: EncryptionService,
    ) { }

    private async generateProjectId(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `PRJ-${year}-`;

        // Find the highest existing project number for this year
        const lastProject = await this.projectRepository
            .createQueryBuilder('project')
            .where('project.projectId LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('project.projectId', 'DESC')
            .getOne();

        let nextNumber = 1;
        if (lastProject) {
            const lastNumber = parseInt(lastProject.projectId.replace(prefix, ''), 10);
            nextNumber = lastNumber + 1;
        }

        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        await this.customersService.findOne(createProjectDto.customerId);

        const projectId = await this.generateProjectId();
        const project = this.projectRepository.create({
            ...createProjectDto,
            projectId,
        });

        return this.projectRepository.save(project);
    }

    async findAll(): Promise<Project[]> {
        return this.projectRepository.find({
            relations: ['customer'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Project[]> {
        // Get projects where the user has assigned tasks
        return this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.customer', 'customer')
            .innerJoin('project.tasks', 'task', 'task.assignedToId = :userId', { userId })
            .orderBy('project.createdAt', 'DESC')
            .getMany();
    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['customer', 'documents', 'reminders', 'tasks'],
        });
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }

    async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
        const project = await this.findOne(id);
        Object.assign(project, updateProjectDto);
        return this.projectRepository.save(project);
    }

    async remove(id: string): Promise<void> {
        const project = await this.findOne(id);
        await this.projectRepository.remove(project);
    }

    // Document Management
    async uploadDocument(
        projectId: string,
        file: Express.Multer.File,
        fileType: DocumentType,
    ): Promise<ProjectDocument> {
        await this.findOne(projectId);

        const uploadDir = path.join(process.cwd(), 'uploads', 'projects', projectId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);

        const document = this.documentRepository.create({
            projectId,
            filePath: `uploads/projects/${projectId}/${fileName}`,
            fileName,
            originalName: file.originalname,
            fileType,
            mimeType: file.mimetype,
            fileSize: file.size,
        });

        return this.documentRepository.save(document);
    }

    async getDocuments(projectId: string): Promise<ProjectDocument[]> {
        return this.documentRepository.find({
            where: { projectId },
            order: { uploadedAt: 'DESC' },
        });
    }

    async deleteDocument(documentId: string): Promise<void> {
        const document = await this.documentRepository.findOne({ where: { id: documentId } });
        if (!document) {
            throw new NotFoundException(`Document not found`);
        }

        const fullPath = path.join(process.cwd(), document.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        await this.documentRepository.remove(document);
    }

    async getDocument(documentId: string): Promise<ProjectDocument> {
        const document = await this.documentRepository.findOne({ where: { id: documentId } });
        if (!document) {
            throw new NotFoundException(`Document not found`);
        }
        return document;
    }

    // Vault Management
    async addVaultItem(createVaultItemDto: CreateVaultItemDto): Promise<ProjectVault> {
        await this.findOne(createVaultItemDto.projectId);

        const encryptedData = this.encryptionService.encrypt(createVaultItemDto.data);

        const vaultItem = this.vaultRepository.create({
            projectId: createVaultItemDto.projectId,
            label: createVaultItemDto.label,
            encryptedData,
            notes: createVaultItemDto.notes,
        });

        return this.vaultRepository.save(vaultItem);
    }

    async getVaultItems(projectId: string): Promise<{ id: string; label: string; notes: string; createdAt: Date }[]> {
        const items = await this.vaultRepository.find({
            where: { projectId },
            order: { createdAt: 'DESC' },
        });

        return items.map((item) => ({
            id: item.id,
            label: item.label,
            notes: item.notes,
            createdAt: item.createdAt,
        }));
    }

    async getVaultItemDecrypted(vaultId: string): Promise<{ label: string; data: string; notes: string }> {
        const item = await this.vaultRepository.findOne({ where: { id: vaultId } });
        if (!item) {
            throw new NotFoundException(`Vault item not found`);
        }

        return {
            label: item.label,
            data: this.encryptionService.decrypt(item.encryptedData),
            notes: item.notes,
        };
    }

    async deleteVaultItem(vaultId: string): Promise<void> {
        const item = await this.vaultRepository.findOne({ where: { id: vaultId } });
        if (!item) {
            throw new NotFoundException(`Vault item not found`);
        }
        await this.vaultRepository.remove(item);
    }

    // Service Reminders
    async addReminder(createReminderDto: CreateServiceReminderDto): Promise<ServiceReminder> {
        await this.findOne(createReminderDto.projectId);

        const reminder = this.reminderRepository.create({
            ...createReminderDto,
            expiryDate: new Date(createReminderDto.expiryDate),
        });

        return this.reminderRepository.save(reminder);
    }

    async getReminders(projectId: string): Promise<ServiceReminder[]> {
        return this.reminderRepository.find({
            where: { projectId },
            order: { expiryDate: 'ASC' },
        });
    }

    async getUpcomingReminders(days: number = 30): Promise<ServiceReminder[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return this.reminderRepository.find({
            where: {
                expiryDate: LessThanOrEqual(futureDate),
                isNotified: false,
            },
            relations: ['project', 'project.customer'],
            order: { expiryDate: 'ASC' },
        });
    }

    async deleteReminder(reminderId: string): Promise<void> {
        const reminder = await this.reminderRepository.findOne({ where: { id: reminderId } });
        if (!reminder) {
            throw new NotFoundException(`Reminder not found`);
        }
        await this.reminderRepository.remove(reminder);
    }

    async markReminderNotified(reminderId: string): Promise<ServiceReminder> {
        const reminder = await this.reminderRepository.findOne({ where: { id: reminderId } });
        if (!reminder) {
            throw new NotFoundException(`Reminder not found`);
        }
        reminder.isNotified = true;
        reminder.lastNotifiedAt = new Date();
        return this.reminderRepository.save(reminder);
    }
}
