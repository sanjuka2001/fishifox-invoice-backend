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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./entities/invoice.entity");
const invoice_item_entity_1 = require("./entities/invoice-item.entity");
const customers_service_1 = require("../customers/customers.service");
const quotations_service_1 = require("../quotations/quotations.service");
const quotation_entity_1 = require("../quotations/entities/quotation.entity");
const settings_service_1 = require("../settings/settings.service");
let InvoicesService = class InvoicesService {
    invoiceRepository;
    itemRepository;
    customersService;
    quotationsService;
    settingsService;
    constructor(invoiceRepository, itemRepository, customersService, quotationsService, settingsService) {
        this.invoiceRepository = invoiceRepository;
        this.itemRepository = itemRepository;
        this.customersService = customersService;
        this.quotationsService = quotationsService;
        this.settingsService = settingsService;
    }
    async generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const lastInvoice = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .where('invoice.invoiceNumber LIKE :prefix', { prefix: `INV-${year}-%` })
            .orderBy('invoice.invoiceNumber', 'DESC')
            .getOne();
        let nextNumber = 1;
        if (lastInvoice) {
            const match = lastInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
    }
    calculateNextInvoiceDate(currentDate, frequency) {
        const next = new Date(currentDate);
        switch (frequency) {
            case invoice_entity_1.InvoiceFrequency.WEEKLY:
                next.setDate(next.getDate() + 7);
                break;
            case invoice_entity_1.InvoiceFrequency.MONTHLY:
                next.setMonth(next.getMonth() + 1);
                break;
            case invoice_entity_1.InvoiceFrequency.ANNUALLY:
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        return next;
    }
    async create(createInvoiceDto) {
        await this.customersService.findOne(createInvoiceDto.customerId);
        const settings = await this.settingsService.getSettings();
        const invoiceNumber = await this.generateInvoiceNumber();
        const items = createInvoiceDto.items.map((item) => {
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
        const invoiceData = {
            invoiceNumber,
            customerId: createInvoiceDto.customerId,
            quotationId: createInvoiceDto.quotationId,
            dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
            notes: createInvoiceDto.notes,
            isRecurring: createInvoiceDto.isRecurring || false,
            frequency: createInvoiceDto.frequency || invoice_entity_1.InvoiceFrequency.NONE,
            currency: createInvoiceDto.currency || 'LKR',
            status: invoice_entity_1.InvoiceStatus.DRAFT,
            items,
            total,
            taxPercentage: taxRate,
        };
        if (createInvoiceDto.isRecurring && createInvoiceDto.frequency && createInvoiceDto.frequency !== invoice_entity_1.InvoiceFrequency.NONE) {
            invoiceData.lastInvoiceDate = new Date();
            invoiceData.nextInvoiceDate = this.calculateNextInvoiceDate(new Date(), createInvoiceDto.frequency);
        }
        const invoice = this.invoiceRepository.create(invoiceData);
        return this.invoiceRepository.save(invoice);
    }
    async createFromQuotation(quotationId) {
        const quotation = await this.quotationsService.findOne(quotationId);
        if (quotation.status !== quotation_entity_1.QuotationStatus.APPROVED) {
            throw new common_1.BadRequestException('Quotation must be approved before converting to invoice');
        }
        const existingInvoice = await this.invoiceRepository.findOne({
            where: { quotationId: quotation.id }
        });
        if (existingInvoice) {
            throw new common_1.BadRequestException('An invoice has already been created for this quotation');
        }
        const items = quotation.items.map((item) => ({
            serviceId: item.serviceId,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
        }));
        return this.create({
            customerId: quotation.customerId,
            quotationId: quotation.id,
            currency: quotation.currency || 'LKR',
            items,
        });
    }
    async findAll() {
        return this.invoiceRepository.find({
            relations: ['customer', 'items'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: ['customer', 'customer.contacts', 'customer.emails', 'items', 'items.service', 'payments'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }
    async findUpcoming(days = 7) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        futureDate.setHours(23, 59, 59, 999);
        const recurringInvoices = await this.invoiceRepository.find({
            where: {
                isRecurring: true,
                nextInvoiceDate: (0, typeorm_2.LessThanOrEqual)(futureDate),
            },
            relations: ['customer'],
            order: { nextInvoiceDate: 'ASC' },
        });
        const overdueInvoices = await this.invoiceRepository.find({
            where: {
                status: invoice_entity_1.InvoiceStatus.OVERDUE,
            },
            relations: ['customer'],
            order: { dueDate: 'ASC' },
        });
        const upcomingDueInvoices = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.customer', 'customer')
            .where('invoice.dueDate >= :today', { today })
            .andWhere('invoice.dueDate <= :futureDate', { futureDate })
            .andWhere('invoice.status NOT IN (:...excludedStatuses)', {
            excludedStatuses: [invoice_entity_1.InvoiceStatus.PAID, invoice_entity_1.InvoiceStatus.DRAFT]
        })
            .orderBy('invoice.dueDate', 'ASC')
            .getMany();
        const allInvoices = [...recurringInvoices];
        for (const invoice of overdueInvoices) {
            if (!allInvoices.find(i => i.id === invoice.id)) {
                allInvoices.push(invoice);
            }
        }
        for (const invoice of upcomingDueInvoices) {
            if (!allInvoices.find(i => i.id === invoice.id)) {
                allInvoices.push(invoice);
            }
        }
        return allInvoices.sort((a, b) => {
            const dateA = a.dueDate || a.nextInvoiceDate || new Date();
            const dateB = b.dueDate || b.nextInvoiceDate || new Date();
            return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
    }
    async generateRecurringInvoice(parentInvoiceId) {
        const parentInvoice = await this.findOne(parentInvoiceId);
        if (!parentInvoice.isRecurring) {
            throw new common_1.BadRequestException('Invoice is not set for recurring');
        }
        const items = parentInvoice.items.map((item) => ({
            serviceId: item.serviceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
        }));
        const newInvoice = await this.create({
            customerId: parentInvoice.customerId,
            items,
            isRecurring: true,
            frequency: parentInvoice.frequency,
            currency: parentInvoice.currency || 'LKR',
        });
        newInvoice.parentInvoiceId = parentInvoice.id;
        await this.invoiceRepository.save(newInvoice);
        parentInvoice.lastInvoiceDate = new Date();
        parentInvoice.nextInvoiceDate = this.calculateNextInvoiceDate(new Date(), parentInvoice.frequency);
        await this.invoiceRepository.save(parentInvoice);
        return newInvoice;
    }
    async update(id, updateInvoiceDto) {
        const invoice = await this.findOne(id);
        if (updateInvoiceDto.items) {
            await this.itemRepository.delete({ invoiceId: id });
            const items = updateInvoiceDto.items.map((item) => {
                const total = item.quantity * item.unitPrice;
                return this.itemRepository.create({ ...item, invoiceId: id, total });
            });
            await this.itemRepository.save(items);
            const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
            let total = subtotal;
            const taxRate = Number(invoice.taxPercentage) || 0;
            if (taxRate > 0) {
                const taxAmount = subtotal * (taxRate / 100);
                total = subtotal + taxAmount;
            }
            invoice.total = total;
        }
        if (updateInvoiceDto.dueDate)
            invoice.dueDate = new Date(updateInvoiceDto.dueDate);
        if (updateInvoiceDto.notes)
            invoice.notes = updateInvoiceDto.notes;
        if (updateInvoiceDto.currency)
            invoice.currency = updateInvoiceDto.currency;
        if (updateInvoiceDto.amountPaid !== undefined) {
            invoice.amountPaid = Number(updateInvoiceDto.amountPaid);
            if (invoice.amountPaid >= invoice.total) {
                invoice.status = invoice_entity_1.InvoiceStatus.PAID;
            }
            else if (invoice.amountPaid > 0) {
                invoice.status = invoice_entity_1.InvoiceStatus.PARTIAL;
            }
            else {
                invoice.status = invoice_entity_1.InvoiceStatus.SENT;
            }
        }
        else if (updateInvoiceDto.status) {
            invoice.status = updateInvoiceDto.status;
        }
        return this.invoiceRepository.save(invoice);
    }
    async updateStatus(id, status) {
        const invoice = await this.findOne(id);
        invoice.status = status;
        return this.invoiceRepository.save(invoice);
    }
    async addPayment(id, amount) {
        const invoice = await this.findOne(id);
        invoice.amountPaid = Number(invoice.amountPaid) + amount;
        if (invoice.amountPaid >= invoice.total) {
            invoice.status = invoice_entity_1.InvoiceStatus.PAID;
        }
        else if (invoice.amountPaid > 0) {
            invoice.status = invoice_entity_1.InvoiceStatus.PARTIAL;
        }
        return this.invoiceRepository.save(invoice);
    }
    async remove(id) {
        const invoice = await this.findOne(id);
        if (invoice.status === invoice_entity_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('Cannot delete a paid invoice');
        }
        await this.invoiceRepository.remove(invoice);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItem)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => quotations_service_1.QuotationsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        customers_service_1.CustomersService,
        quotations_service_1.QuotationsService,
        settings_service_1.SettingsService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map