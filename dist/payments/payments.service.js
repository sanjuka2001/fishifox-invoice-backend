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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const invoices_service_1 = require("../invoices/invoices.service");
let PaymentsService = class PaymentsService {
    paymentRepository;
    invoicesService;
    constructor(paymentRepository, invoicesService) {
        this.paymentRepository = paymentRepository;
        this.invoicesService = invoicesService;
    }
    async create(createPaymentDto) {
        await this.invoicesService.findOne(createPaymentDto.invoiceId);
        const payment = this.paymentRepository.create({
            ...createPaymentDto,
            paymentDate: new Date(createPaymentDto.paymentDate),
        });
        const savedPayment = await this.paymentRepository.save(payment);
        await this.invoicesService.addPayment(createPaymentDto.invoiceId, createPaymentDto.amount);
        return savedPayment;
    }
    async findAll() {
        return this.paymentRepository.find({
            relations: ['invoice', 'invoice.customer'],
            order: { paymentDate: 'DESC' },
        });
    }
    async findByInvoice(invoiceId) {
        return this.paymentRepository.find({
            where: { invoiceId },
            order: { paymentDate: 'DESC' },
        });
    }
    async findByDateRange(startDate, endDate) {
        return this.paymentRepository.find({
            where: {
                paymentDate: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['invoice', 'invoice.customer'],
            order: { paymentDate: 'DESC' },
        });
    }
    async getTotalByDateRange(startDate, endDate) {
        const result = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.paymentDate BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .getRawOne();
        return Number(result?.total) || 0;
    }
    async findOne(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['invoice'],
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async remove(id) {
        const payment = await this.findOne(id);
        await this.paymentRepository.remove(payment);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        invoices_service_1.InvoicesService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map