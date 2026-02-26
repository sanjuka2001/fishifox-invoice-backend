"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectDocument = exports.DocumentType = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
var DocumentType;
(function (DocumentType) {
    DocumentType["AGREEMENT"] = "agreement";
    DocumentType["CONTRACT"] = "contract";
    DocumentType["GENERAL"] = "general";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
let ProjectDocument = class ProjectDocument {
    id;
    project;
    projectId;
    filePath;
    fileName;
    originalName;
    fileType;
    mimeType;
    fileSize;
    uploadedAt;
};
exports.ProjectDocument = ProjectDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (project) => project.documents, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectDocument.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], ProjectDocument.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectDocument.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectDocument.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectDocument.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentType,
        default: DocumentType.GENERAL,
    }),
    __metadata("design:type", String)
], ProjectDocument.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectDocument.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ProjectDocument.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProjectDocument.prototype, "uploadedAt", void 0);
exports.ProjectDocument = ProjectDocument = __decorate([
    (0, typeorm_1.Entity)('project_documents')
], ProjectDocument);
//# sourceMappingURL=project-document.entity.js.map