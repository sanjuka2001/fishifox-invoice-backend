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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const pdf_service_1 = require("../common/services/pdf.service");
const dto_1 = require("./dto");
const guards_1 = require("../common/guards");
const decorators_1 = require("../common/decorators");
const user_entity_1 = require("../users/entities/user.entity");
let PaymentsController = class PaymentsController {
    paymentsService;
    pdfService;
    constructor(paymentsService, pdfService) {
        this.paymentsService = paymentsService;
        this.pdfService = pdfService;
    }
    create(createPaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }
    findAll() {
        return this.paymentsService.findAll();
    }
    findByDateRange(startDate, endDate) {
        return this.paymentsService.findByDateRange(new Date(startDate), new Date(endDate));
    }
    findByInvoice(invoiceId) {
        return this.paymentsService.findByInvoice(invoiceId);
    }
    findOne(id) {
        return this.paymentsService.findOne(id);
    }
    async generateReceiptPdf(paymentData, res) {
        const buffer = await this.pdfService.generatePaymentPdf(paymentData);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=payment-${paymentData.id || 'receipt'}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    remove(id) {
        return this.paymentsService.remove(id);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Record a new payment' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-date-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payments by date range' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: String }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findByDateRange", null);
__decorate([
    (0, common_1.Get)('invoice/:invoiceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payments for an invoice' }),
    __param(0, (0, common_1.Param)('invoiceId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findByInvoice", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a payment by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('receipt-pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate payment receipt PDF from data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "generateReceiptPdf", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a payment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "remove", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        pdf_service_1.PdfService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map