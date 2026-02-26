import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto';
import { InvoicesService } from '../invoices/invoices.service';
export declare class PaymentsService {
    private readonly paymentRepository;
    private readonly invoicesService;
    constructor(paymentRepository: Repository<Payment>, invoicesService: InvoicesService);
    create(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    findAll(): Promise<Payment[]>;
    findByInvoice(invoiceId: string): Promise<Payment[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]>;
    getTotalByDateRange(startDate: Date, endDate: Date): Promise<number>;
    findOne(id: string): Promise<Payment>;
    remove(id: string): Promise<void>;
}
