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
exports.Invoice = exports.InvoiceFrequency = exports.InvoiceStatus = exports.InvoiceCurrency = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const quotation_entity_1 = require("../../quotations/entities/quotation.entity");
const invoice_item_entity_1 = require("./invoice-item.entity");
const payment_entity_1 = require("../../payments/entities/payment.entity");
var InvoiceCurrency;
(function (InvoiceCurrency) {
    InvoiceCurrency["LKR"] = "LKR";
    InvoiceCurrency["USD"] = "USD";
})(InvoiceCurrency || (exports.InvoiceCurrency = InvoiceCurrency = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["PARTIAL"] = "partial";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var InvoiceFrequency;
(function (InvoiceFrequency) {
    InvoiceFrequency["NONE"] = "none";
    InvoiceFrequency["WEEKLY"] = "weekly";
    InvoiceFrequency["MONTHLY"] = "monthly";
    InvoiceFrequency["ANNUALLY"] = "annually";
})(InvoiceFrequency || (exports.InvoiceFrequency = InvoiceFrequency = {}));
let Invoice = class Invoice {
    id;
    invoiceNumber;
    customer;
    customerId;
    quotation;
    quotationId;
    status;
    currency;
    isRecurring;
    frequency;
    parentInvoice;
    parentInvoiceId;
    lastInvoiceDate;
    nextInvoiceDate;
    total;
    amountPaid;
    taxPercentage;
    dueDate;
    notes;
    items;
    payments;
    createdAt;
    updatedAt;
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, (customer) => customer.invoices),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Invoice.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], Invoice.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => quotation_entity_1.Quotation, (quotation) => quotation.invoice, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'quotation_id' }),
    __metadata("design:type", quotation_entity_1.Quotation)
], Invoice.prototype, "quotation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quotation_id', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "quotationId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvoiceCurrency,
        default: InvoiceCurrency.LKR,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Invoice.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvoiceFrequency,
        default: InvoiceFrequency.NONE,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Invoice, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_invoice_id' }),
    __metadata("design:type", Invoice)
], Invoice.prototype, "parentInvoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_invoice_id', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "parentInvoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "lastInvoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "nextInvoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amountPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_item_entity_1.InvoiceItem, (item) => item.invoice, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.invoice),
    __metadata("design:type", Array)
], Invoice.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "updatedAt", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)('invoices')
], Invoice);
//# sourceMappingURL=invoice.entity.js.map