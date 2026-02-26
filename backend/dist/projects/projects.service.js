"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const project_document_entity_1 = require("./entities/project-document.entity");
const project_vault_entity_1 = require("./entities/project-vault.entity");
const service_reminder_entity_1 = require("./entities/service-reminder.entity");
const customers_service_1 = require("../customers/customers.service");
const encryption_service_1 = require("./services/encryption.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let ProjectsService = class ProjectsService {
    projectRepository;
    documentRepository;
    vaultRepository;
    reminderRepository;
    customersService;
    encryptionService;
    constructor(projectRepository, documentRepository, vaultRepository, reminderRepository, customersService, encryptionService) {
        this.projectRepository = projectRepository;
        this.documentRepository = documentRepository;
        this.vaultRepository = vaultRepository;
        this.reminderRepository = reminderRepository;
        this.customersService = customersService;
        this.encryptionService = encryptionService;
    }
    async generateProjectId() {
        const year = new Date().getFullYear();
        const prefix = `PRJ-${year}-`;
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
    async create(createProjectDto) {
        await this.customersService.findOne(createProjectDto.customerId);
        const projectId = await this.generateProjectId();
        const project = this.projectRepository.create({
            ...createProjectDto,
            projectId,
        });
        return this.projectRepository.save(project);
    }
    async findAll() {
        return this.projectRepository.find({
            relations: ['customer'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByUser(userId) {
        return this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.customer', 'customer')
            .innerJoin('project.tasks', 'task', 'task.assignedToId = :userId', { userId })
            .orderBy('project.createdAt', 'DESC')
            .getMany();
    }
    async findOne(id) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['customer', 'documents', 'reminders', 'tasks'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }
    async update(id, updateProjectDto) {
        const project = await this.findOne(id);
        Object.assign(project, updateProjectDto);
        return this.projectRepository.save(project);
    }
    async remove(id) {
        const project = await this.findOne(id);
        await this.projectRepository.remove(project);
    }
    async uploadDocument(projectId, file, fileType) {
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
    async getDocuments(projectId) {
        return this.documentRepository.find({
            where: { projectId },
            order: { uploadedAt: 'DESC' },
        });
    }
    async deleteDocument(documentId) {
        const document = await this.documentRepository.findOne({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException(`Document not found`);
        }
        const fullPath = path.join(process.cwd(), document.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
        await this.documentRepository.remove(document);
    }
    async getDocument(documentId) {
        const document = await this.documentRepository.findOne({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException(`Document not found`);
        }
        return document;
    }
    async addVaultItem(createVaultItemDto) {
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
    async getVaultItems(projectId) {
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
    async getVaultItemDecrypted(vaultId) {
        const item = await this.vaultRepository.findOne({ where: { id: vaultId } });
        if (!item) {
            throw new common_1.NotFoundException(`Vault item not found`);
        }
        return {
            label: item.label,
            data: this.encryptionService.decrypt(item.encryptedData),
            notes: item.notes,
        };
    }
    async deleteVaultItem(vaultId) {
        const item = await this.vaultRepository.findOne({ where: { id: vaultId } });
        if (!item) {
            throw new common_1.NotFoundException(`Vault item not found`);
        }
        await this.vaultRepository.remove(item);
    }
    async addReminder(createReminderDto) {
        await this.findOne(createReminderDto.projectId);
        const reminder = this.reminderRepository.create({
            ...createReminderDto,
            expiryDate: new Date(createReminderDto.expiryDate),
        });
        return this.reminderRepository.save(reminder);
    }
    async getReminders(projectId) {
        return this.reminderRepository.find({
            where: { projectId },
            order: { expiryDate: 'ASC' },
        });
    }
    async getUpcomingReminders(days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return this.reminderRepository.find({
            where: {
                expiryDate: (0, typeorm_2.LessThanOrEqual)(futureDate),
                isNotified: false,
            },
            relations: ['project', 'project.customer'],
            order: { expiryDate: 'ASC' },
        });
    }
    async deleteReminder(reminderId) {
        const reminder = await this.reminderRepository.findOne({ where: { id: reminderId } });
        if (!reminder) {
            throw new common_1.NotFoundException(`Reminder not found`);
        }
        await this.reminderRepository.remove(reminder);
    }
    async markReminderNotified(reminderId) {
        const reminder = await this.reminderRepository.findOne({ where: { id: reminderId } });
        if (!reminder) {
            throw new common_1.NotFoundException(`Reminder not found`);
        }
        reminder.isNotified = true;
        reminder.lastNotifiedAt = new Date();
        return this.reminderRepository.save(reminder);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_document_entity_1.ProjectDocument)),
    __param(2, (0, typeorm_1.InjectRepository)(project_vault_entity_1.ProjectVault)),
    __param(3, (0, typeorm_1.InjectRepository)(service_reminder_entity_1.ServiceReminder)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        customers_service_1.CustomersService,
        encryption_service_1.EncryptionService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map