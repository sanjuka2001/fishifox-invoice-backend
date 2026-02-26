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
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quotation_entity_1 = require("./entities/quotation.entity");
const quotation_item_entity_1 = require("./entities/quotation-item.entity");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
const customers_service_1 = require("../customers/customers.service");
const settings_service_1 = require("../settings/settings.service");
let QuotationsService = class QuotationsService {
    quotationRepository;
    itemRepository;
    invoiceRepository;
    customersService;
    settingsService;
    constructor(quotationRepository, itemRepository, invoiceRepository, customersService, settingsService) {
        this.quotationRepository = quotationRepository;
        this.itemRepository = itemRepository;
        this.invoiceRepository = invoiceRepository;
        this.customersService = customersService;
        this.settingsService = settingsService;
    }
    async generateQuoteNumber() {
        const year = new Date().getFullYear();
        const count = await this.quotationRepository.count();
        return `QT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    async create(createQuotationDto) {
        await this.customersService.findOne(createQuotationDto.customerId);
        const settings = await this.settingsService.getSettings();
        const quoteNumber = await this.generateQuoteNumber();
        const items = createQuotationDto.items.map((item) => {
            const total = item.quantity * item.unitPrice;
            return this.itemRepository.create({ ...item, total });
        });
        const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
        let total = subtotal;
        const taxRate = Number(settings?.taxPercentage) || 0;
        if (taxRate > 0) {
            const taxAmount = subtotal * (taxRate / 100);
            total = subtotal + taxAmount;
        }
        const quotation = this.quotationRepository.create({
            quoteNumber,
            customerId: createQuotationDto.customerId,
            projectId: createQuotationDto.projectId,
            validUntil: createQuotationDto.validUntil,
            notes: createQuotationDto.notes,
            attentionTo: createQuotationDto.attentionTo,
            currency: createQuotationDto.currency || 'LKR',
            status: quotation_entity_1.QuotationStatus.DRAFT,
            items,
            total,
            taxPercentage: taxRate,
        });
        return this.quotationRepository.save(quotation);
    }
    async findAll() {
        return this.quotationRepository.find({
            relations: ['customer', 'items', 'project'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const quotation = await this.quotationRepository.findOne({
            where: { id },
            relations: ['customer', 'customer.contacts', 'customer.emails', 'items', 'items.service', 'project'],
        });
        if (!quotation) {
            throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
        }
        return quotation;
    }
    async update(id, updateQuotationDto) {
        const quotation = await this.findOne(id);
        if (quotation.status === quotation_entity_1.QuotationStatus.APPROVED) {
            throw new common_1.BadRequestException('Cannot update an approved quotation');
        }
        if (updateQuotationDto.items) {
            await this.itemRepository.delete({ quotationId: id });
            const items = updateQuotationDto.items.map((item) => {
                const total = item.quantity * item.unitPrice;
                return this.itemRepository.create({ ...item, quotationId: id, total });
            });
            await this.itemRepository.save(items);
            const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
            let total = subtotal;
            const taxRate = Number(quotation.taxPercentage) || 0;
            if (taxRate > 0) {
                const taxAmount = subtotal * (taxRate / 100);
                total = subtotal + taxAmount;
            }
            quotation.total = total;
        }
        if (updateQuotationDto.validUntil)
            quotation.validUntil = new Date(updateQuotationDto.validUntil);
        if (updateQuotationDto.notes)
            quotation.notes = updateQuotationDto.notes;
        if (updateQuotationDto.status)
            quotation.status = updateQuotationDto.status;
        if (updateQuotationDto.projectId)
            quotation.projectId = updateQuotationDto.projectId;
        if (updateQuotationDto.attentionTo !== undefined)
            quotation.attentionTo = updateQuotationDto.attentionTo;
        if (updateQuotationDto.currency)
            quotation.currency = updateQuotationDto.currency;
        return this.quotationRepository.save(quotation);
    }
    async updateStatus(id, status) {
        const quotation = await this.findOne(id);
        quotation.status = status;
        return this.quotationRepository.save(quotation);
    }
    async remove(id) {
        const quotation = await this.findOne(id);
        await this.invoiceRepository.update({ quotationId: id }, { quotationId: null });
        await this.itemRepository.delete({ quotationId: id });
        await this.quotationRepository.remove(quotation);
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quotation_entity_1.Quotation)),
    __param(1, (0, typeorm_1.InjectRepository)(quotation_item_entity_1.QuotationItem)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        customers_service_1.CustomersService,
        settings_service_1.SettingsService])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map