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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("./invoices.service");
const dto_1 = require("./dto");
const guards_1 = require("../common/guards");
const decorators_1 = require("../common/decorators");
const user_entity_1 = require("../users/entities/user.entity");
const invoice_entity_1 = require("./entities/invoice.entity");
const pdf_service_1 = require("../common/services/pdf.service");
const mail_service_1 = require("../mail/mail.service");
let InvoicesController = class InvoicesController {
    invoicesService;
    pdfService;
    mailService;
    constructor(invoicesService, pdfService, mailService) {
        this.invoicesService = invoicesService;
        this.pdfService = pdfService;
        this.mailService = mailService;
    }
    create(createInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }
    async createFromQuotation(quotationId) {
        try {
            console.log('Creating invoice from quotation:', quotationId);
            const invoice = await this.invoicesService.createFromQuotation(quotationId);
            console.log('Invoice created successfully:', invoice.invoiceNumber);
            return invoice;
        }
        catch (error) {
            console.error('Failed to create invoice from quotation:', error.message);
            console.error('Full error:', error);
            throw error;
        }
    }
    findAll() {
        return this.invoicesService.findAll();
    }
    findUpcoming(days) {
        return this.invoicesService.findUpcoming(days || 30);
    }
    findOne(id) {
        return this.invoicesService.findOne(id);
    }
    async generatePdf(id, res) {
        const invoice = await this.invoicesService.findOne(id);
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        });
        res.send(pdfBuffer);
    }
    generateRecurring(id) {
        return this.invoicesService.generateRecurringInvoice(id);
    }
    update(id, updateInvoiceDto) {
        return this.invoicesService.update(id, updateInvoiceDto);
    }
    async send(id) {
        const invoice = await this.invoicesService.findOne(id);
        let customerEmail = null;
        if (invoice.customer?.contacts?.length > 0) {
            customerEmail = invoice.customer.contacts[0].email;
        }
        else if (invoice.customer?.emails?.length > 0) {
            customerEmail = invoice.customer.emails[0].email;
        }
        if (!customerEmail) {
            throw new Error('Customer does not have an email address');
        }
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
        await this.mailService.sendInvoiceEmail(customerEmail, invoice.customer.companyName, invoice.invoiceNumber, pdfBuffer);
        return this.invoicesService.updateStatus(id, invoice_entity_1.InvoiceStatus.SENT);
    }
    remove(id) {
        return this.invoicesService.remove(id);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('from-quotation/:quotationId'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create invoice from approved quotation' }),
    __param(0, (0, common_1.Param)('quotationId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "createFromQuotation", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invoices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming recurring invoices' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an invoice by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate PDF for invoice' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)(':id/generate-recurring'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate next recurring invoice' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "generateRecurring", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update an invoice' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Send invoice email to customer' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "send", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an invoice' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "remove", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('invoices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        pdf_service_1.PdfService,
        mail_service_1.MailService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map