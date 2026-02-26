import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly invoicesService: InvoicesService,
    ) { }

    async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
        await this.invoicesService.findOne(createPaymentDto.invoiceId);

        const payment = this.paymentRepository.create({
            ...createPaymentDto,
            paymentDate: new Date(createPaymentDto.paymentDate),
        });

        const savedPayment = await this.paymentRepository.save(payment);

        await this.invoicesService.addPayment(
            createPaymentDto.invoiceId,
            createPaymentDto.amount,
        );

        return savedPayment;
    }

    async findAll(): Promise<Payment[]> {
        return this.paymentRepository.find({
            relations: ['invoice', 'invoice.customer'],
            order: { paymentDate: 'DESC' },
        });
    }

    async findByInvoice(invoiceId: string): Promise<Payment[]> {
        return this.paymentRepository.find({
            where: { invoiceId },
            order: { paymentDate: 'DESC' },
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
        return this.paymentRepository.find({
            where: {
                paymentDate: Between(startDate, endDate),
            },
            relations: ['invoice', 'invoice.customer'],
            order: { paymentDate: 'DESC' },
        });
    }

    async getTotalByDateRange(startDate: Date, endDate: Date): Promise<number> {
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

    async findOne(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['invoice'],
        });
        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }

    async remove(id: string): Promise<void> {
        const payment = await this.findOne(id);
        await this.paymentRepository.remove(payment);
    }
}
