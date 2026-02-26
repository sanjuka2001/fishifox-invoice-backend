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
exports.Customer = void 0;
const typeorm_1 = require("typeorm");
const customer_email_entity_1 = require("./customer-email.entity");
const contact_person_entity_1 = require("./contact-person.entity");
const quotation_entity_1 = require("../../quotations/entities/quotation.entity");
const invoice_entity_1 = require("../../invoices/entities/invoice.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
let Customer = class Customer {
    id;
    companyName;
    address;
    isActive;
    contacts;
    emails;
    quotations;
    invoices;
    projects;
    createdAt;
    updatedAt;
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Customer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'company_name', default: '' }),
    __metadata("design:type", String)
], Customer.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => contact_person_entity_1.ContactPerson, (contact) => contact.customer, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Customer.prototype, "contacts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_email_entity_1.CustomerEmail, (email) => email.customer, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Customer.prototype, "emails", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_entity_1.Quotation, (quotation) => quotation.customer),
    __metadata("design:type", Array)
], Customer.prototype, "quotations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_entity_1.Invoice, (invoice) => invoice.customer),
    __metadata("design:type", Array)
], Customer.prototype, "invoices", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_entity_1.Project, (project) => project.customer),
    __metadata("design:type", Array)
], Customer.prototype, "projects", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Customer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Customer.prototype, "updatedAt", void 0);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers')
], Customer);
//# sourceMappingURL=customer.entity.js.map