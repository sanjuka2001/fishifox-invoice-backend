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
exports.QuotationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quotations_service_1 = require("./quotations.service");
const dto_1 = require("./dto");
const guards_1 = require("../common/guards");
const decorators_1 = require("../common/decorators");
const user_entity_1 = require("../users/entities/user.entity");
const quotation_entity_1 = require("./entities/quotation.entity");
const pdf_service_1 = require("../common/services/pdf.service");
const mail_service_1 = require("../mail/mail.service");
let QuotationsController = class QuotationsController {
    quotationsService;
    pdfService;
    mailService;
    constructor(quotationsService, pdfService, mailService) {
        this.quotationsService = quotationsService;
        this.pdfService = pdfService;
        this.mailService = mailService;
    }
    create(createQuotationDto) {
        return this.quotationsService.create(createQuotationDto);
    }
    findAll() {
        return this.quotationsService.findAll();
    }
    findOne(id) {
        return this.quotationsService.findOne(id);
    }
    async generatePdf(id, preview, res) {
        const quotation = await this.quotationsService.findOne(id);
        const pdfBuffer = await this.pdfService.generateQuotationPdf(quotation);
        const disposition = preview === 'true' ? 'inline' : 'attachment';
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${disposition}; filename="quotation-${quotation.quoteNumber}.pdf"`,
        });
        res.send(pdfBuffer);
    }
    update(id, updateQuotationDto) {
        return this.quotationsService.update(id, updateQuotationDto);
    }
    async approve(id) {
        return this.quotationsService.updateStatus(id, quotation_entity_1.QuotationStatus.APPROVED);
    }
    async send(id) {
        console.log('Fetching quotation:', id);
        const quotation = await this.quotationsService.findOne(id);
        console.log('Quotation found:', quotation.quoteNumber);
        console.log('Customer:', quotation.customer?.companyName);
        console.log('Customer contacts:', quotation.customer?.contacts?.length || 0);
        console.log('Customer emails:', quotation.customer?.emails?.length || 0);
        let customerEmail = null;
        if (quotation.customer?.contacts?.length > 0) {
            customerEmail = quotation.customer.contacts[0].email;
        }
        else if (quotation.customer?.emails?.length > 0) {
            customerEmail = quotation.customer.emails[0].email;
        }
        console.log('Customer email:', customerEmail);
        if (!customerEmail) {
            throw new common_1.BadRequestException('Customer does not have an email address');
        }
        console.log('Generating PDF...');
        const pdfBuffer = await this.pdfService.generateQuotationPdf(quotation);
        console.log('PDF generated, size:', pdfBuffer.length);
        try {
            console.log('Sending email to:', customerEmail);
            await this.mailService.sendQuotationEmail(customerEmail, quotation.customer.companyName, quotation.quoteNumber, pdfBuffer);
            console.log('Email sent successfully!');
        }
        catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            throw new common_1.BadRequestException(`Failed to send email: ${emailError.message || 'Unknown email error'}. Please check your SMTP configuration.`);
        }
        return this.quotationsService.updateStatus(id, quotation_entity_1.QuotationStatus.SENT);
    }
    remove(id) {
        return this.quotationsService.remove(id);
    }
};
exports.QuotationsController = QuotationsController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new quotation' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateQuotationDto]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all quotations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a quotation by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate PDF for quotation' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('preview')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a quotation' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateQuotationDto]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Approve quotation and convert to invoice' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Send quotation email to customer' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "send", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a quotation' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "remove", null);
exports.QuotationsController = QuotationsController = __decorate([
    (0, swagger_1.ApiTags)('quotations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('quotations'),
    __metadata("design:paramtypes", [quotations_service_1.QuotationsService,
        pdf_service_1.PdfService,
        mail_service_1.MailService])
], QuotationsController);
//# sourceMappingURL=quotations.controller.js.map