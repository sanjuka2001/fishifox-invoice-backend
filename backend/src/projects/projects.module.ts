import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { ProjectVault } from './entities/project-vault.entity';
import { ServiceReminder } from './entities/service-reminder.entity';
import { CustomersModule } from '../customers/customers.module';
import { EncryptionService } from './services/encryption.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project, ProjectDocument, ProjectVault, ServiceReminder]),
        MulterModule.register({
            storage: memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
            },
        }),
        CustomersModule,
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService, EncryptionService],
    exports: [ProjectsService],
})
export class ProjectsModule { }
