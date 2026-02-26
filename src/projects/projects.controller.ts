import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    UploadedFile,
    UseInterceptors,
    Res,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, CreateVaultItemDto, CreateServiceReminderDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';
import { DocumentType } from './entities/project-document.entity';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new project' })
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects' })
    findAll() {
        return this.projectsService.findAll();
    }

    @Get('my-projects')
    @ApiOperation({ summary: 'Get projects where user has assigned tasks' })
    getMyProjects(@CurrentUser('id') userId: string) {
        return this.projectsService.findByUser(userId);
    }

    @Get('upcoming-reminders')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get upcoming service reminders' })
    @ApiQuery({ name: 'days', required: false, type: Number })
    getUpcomingReminders(@Query('days') days?: number) {
        return this.projectsService.getUpcomingReminders(days || 30);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a project by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a project' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a project' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.remove(id);
    }

    // Document endpoints
    @Post(':id/documents')
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a document' })
    @ApiConsumes('multipart/form-data')
    uploadDocument(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('fileType') fileType: DocumentType,
    ) {
        return this.projectsService.uploadDocument(id, file, fileType || DocumentType.GENERAL);
    }

    @Get(':id/documents')
    @ApiOperation({ summary: 'Get project documents' })
    getDocuments(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getDocuments(id);
    }

    @Get('documents/:documentId/download')
    @ApiOperation({ summary: 'Download a document' })
    async downloadDocument(
        @Param('documentId', ParseUUIDPipe) documentId: string,
        @Res() res: Response,
    ) {
        const document = await this.projectsService.getDocument(documentId);

        const filePath = path.join(process.cwd(), document.filePath);
        if (fs.existsSync(filePath)) {
            res.download(filePath, document.originalName);
        } else {
            res.status(404).send('File not found on server');
        }
    }

    @Delete('documents/:documentId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a document' })
    deleteDocument(@Param('documentId', ParseUUIDPipe) documentId: string) {
        return this.projectsService.deleteDocument(documentId);
    }

    // Vault endpoints
    @Post(':id/vault')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Add vault item' })
    addVaultItem(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() createVaultItemDto: Omit<CreateVaultItemDto, 'projectId'>,
    ) {
        return this.projectsService.addVaultItem({ ...createVaultItemDto, projectId: id } as CreateVaultItemDto);
    }

    @Get(':id/vault')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get vault items (labels only)' })
    getVaultItems(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getVaultItems(id);
    }

    @Get('vault/:vaultId/decrypt')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get decrypted vault item' })
    getVaultItemDecrypted(@Param('vaultId', ParseUUIDPipe) vaultId: string) {
        return this.projectsService.getVaultItemDecrypted(vaultId);
    }

    @Delete('vault/:vaultId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete vault item' })
    deleteVaultItem(@Param('vaultId', ParseUUIDPipe) vaultId: string) {
        return this.projectsService.deleteVaultItem(vaultId);
    }

    // Reminder endpoints
    @Post(':id/reminders')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Add service reminder' })
    addReminder(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() createReminderDto: Omit<CreateServiceReminderDto, 'projectId'>,
    ) {
        return this.projectsService.addReminder({ ...createReminderDto, projectId: id } as CreateServiceReminderDto);
    }

    @Get(':id/reminders')
    @ApiOperation({ summary: 'Get project reminders' })
    getReminders(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getReminders(id);
    }

    @Delete('reminders/:reminderId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete reminder' })
    deleteReminder(@Param('reminderId', ParseUUIDPipe) reminderId: string) {
        return this.projectsService.deleteReminder(reminderId);
    }
}
