"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const projects_service_1 = require("./projects.service");
const projects_controller_1 = require("./projects.controller");
const project_entity_1 = require("./entities/project.entity");
const project_document_entity_1 = require("./entities/project-document.entity");
const project_vault_entity_1 = require("./entities/project-vault.entity");
const service_reminder_entity_1 = require("./entities/service-reminder.entity");
const customers_module_1 = require("../customers/customers.module");
const encryption_service_1 = require("./services/encryption.service");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project, project_document_entity_1.ProjectDocument, project_vault_entity_1.ProjectVault, service_reminder_entity_1.ServiceReminder]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
            customers_module_1.CustomersModule,
        ],
        controllers: [projects_controller_1.ProjectsController],
        providers: [projects_service_1.ProjectsService, encryption_service_1.EncryptionService],
        exports: [projects_service_1.ProjectsService],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map