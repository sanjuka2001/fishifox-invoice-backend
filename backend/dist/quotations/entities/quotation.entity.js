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
exports.Quotation = exports.QuotationStatus = exports.QuotationCurrency = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const quotation_item_entity_1 = require("./quotation-item.entity");
const invoice_entity_1 = require("../../invoices/entities/invoice.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
var QuotationCurrency;
(function (QuotationCurrency) {
    QuotationCurrency["LKR"] = "LKR";
    QuotationCurrency["USD"] = "USD";
})(QuotationCurrency || (exports.QuotationCurrency = QuotationCurrency = {}));
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["DRAFT"] = "draft";
    QuotationStatus["SENT"] = "sent";
    QuotationStatus["APPROVED"] = "approved";
    QuotationStatus["REJECTED"] = "rejected";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
let Quotation = class Quotation {
    id;
    quoteNumber;
    customer;
    customerId;
    project;
    projectId;
    attentionTo;
    status;
    currency;
    total;
    validUntil;
    taxPercentage;
    notes;
    items;
    invoice;
    createdAt;
    updatedAt;
};
exports.Quotation = Quotation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Quotation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Quotation.prototype, "quoteNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, (customer) => customer.quotations),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Quotation.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], Quotation.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], Quotation.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "attentionTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QuotationStatus,
        default: QuotationStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Quotation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QuotationCurrency,
        default: QuotationCurrency.LKR,
    }),
    __metadata("design:type", String)
], Quotation.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "taxPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_item_entity_1.QuotationItem, (item) => item.quotation, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Quotation.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => invoice_entity_1.Invoice, (invoice) => invoice.quotation),
    __metadata("design:type", invoice_entity_1.Invoice)
], Quotation.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Quotation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Quotation.prototype, "updatedAt", void 0);
exports.Quotation = Quotation = __decorate([
    (0, typeorm_1.Entity)('quotations')
], Quotation);
//# sourceMappingURL=quotation.entity.js.map