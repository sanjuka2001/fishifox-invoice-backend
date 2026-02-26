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
exports.ServiceReminder = exports.ServiceType = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
var ServiceType;
(function (ServiceType) {
    ServiceType["DOMAIN"] = "domain";
    ServiceType["SSL"] = "ssl";
    ServiceType["HOSTING"] = "hosting";
    ServiceType["OTHER"] = "other";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
let ServiceReminder = class ServiceReminder {
    id;
    project;
    projectId;
    serviceName;
    serviceType;
    expiryDate;
    remindBeforeDays;
    isNotified;
    lastNotifiedAt;
    notes;
    createdAt;
    updatedAt;
};
exports.ServiceReminder = ServiceReminder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ServiceReminder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (project) => project.reminders, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ServiceReminder.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], ServiceReminder.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServiceReminder.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ServiceType,
        default: ServiceType.OTHER,
    }),
    __metadata("design:type", String)
], ServiceReminder.prototype, "serviceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ServiceReminder.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 7 }),
    __metadata("design:type", Number)
], ServiceReminder.prototype, "remindBeforeDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ServiceReminder.prototype, "isNotified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ServiceReminder.prototype, "lastNotifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ServiceReminder.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServiceReminder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServiceReminder.prototype, "updatedAt", void 0);
exports.ServiceReminder = ServiceReminder = __decorate([
    (0, typeorm_1.Entity)('service_reminders')
], ServiceReminder);
//# sourceMappingURL=service-reminder.entity.js.map