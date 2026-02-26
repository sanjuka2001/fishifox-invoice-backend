import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceFrequency } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { CustomersService } from '../customers/customers.service';
import { QuotationsService } from '../quotations/quotations.service';
import { QuotationStatus } from '../quotations/entities/quotation.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(InvoiceItem)
        private readonly itemRepository: Repository<InvoiceItem>,
        private readonly customersService: CustomersService,
        @Inject(forwardRef(() => QuotationsService))
        private readonly quotationsService: QuotationsService,
        private readonly settingsService: SettingsService,
    ) { }

    private async generateInvoiceNumber(): Promise<string> {
        const year = new Date().getFullYear();

        // Find the highest invoice number for this year
        const lastInvoice = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .where('invoice.invoiceNumber LIKE :prefix', { prefix: `INV-${year}-%` })
            .orderBy('invoice.invoiceNumber', 'DESC')
            .getOne();

        let nextNumber = 1;
        if (lastInvoice) {
            // Extract the number part from INV-YYYY-XXXX
            const match = lastInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
    }

    private calculateNextInvoiceDate(currentDate: Date, frequency: InvoiceFrequency): Date {
        const next = new Date(currentDate);
        switch (frequency) {
            case InvoiceFrequency.WEEKLY:
                next.setDate(next.getDate() + 7);
                break;
            case InvoiceFrequency.MONTHLY:
                next.setMonth(next.getMonth() + 1);
                break;
            case InvoiceFrequency.ANNUALLY:
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        return next;
    }

    async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        await this.customersService.findOne(createInvoiceDto.customerId);
        const settings = await this.settingsService.getSettings();

        const invoiceNumber = await this.generateInvoiceNumber();

        const items = createInvoiceDto.items.map((item) => {
            const total = item.quantity * item.unitPrice;
            return this.itemRepository.create({ ...item, total });
        });

        const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
        let total = subtotal;

        // Calculate tax with null safety
        const taxRate = Number(settings?.taxPercentage) || 0;
        if (taxRate > 0) {
            const taxAmount = subtotal * (taxRate / 100);
            total = subtotal + taxAmount;
        }

        const invoiceData: Partial<Invoice> = {
            invoiceNumber,
            customerId: createInvoiceDto.customerId,
            quotationId: createInvoiceDto.quotationId,
            dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
            notes: createInvoiceDto.notes,
            isRecurring: createInvoiceDto.isRecurring || false,
            frequency: createInvoiceDto.frequency || InvoiceFrequency.NONE,
            currency: (createInvoiceDto as any).currency || 'LKR',
            status: InvoiceStatus.DRAFT,
            items,
            total,
            taxPercentage: taxRate,
        };

        // Handle recurring invoice dates
        if (createInvoiceDto.isRecurring && createInvoiceDto.frequency && createInvoiceDto.frequency !== InvoiceFrequency.NONE) {
            invoiceData.lastInvoiceDate = new Date();
            invoiceData.nextInvoiceDate = this.calculateNextInvoiceDate(
                new Date(),
                createInvoiceDto.frequency,
            );
        }

        const invoice = this.invoiceRepository.create(invoiceData);
        return this.invoiceRepository.save(invoice);
    }

    async createFromQuotation(quotationId: string): Promise<Invoice> {
        const quotation = await this.quotationsService.findOne(quotationId);

        if (quotation.status !== QuotationStatus.APPROVED) {
            throw new BadRequestException('Quotation must be approved before converting to invoice');
        }

        // Check if an invoice already exists for this quotation
        const existingInvoice = await this.invoiceRepository.findOne({
            where: { quotationId: quotation.id }
        });

        if (existingInvoice) {
            throw new BadRequestException('An invoice has already been created for this quotation');
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
            currency: (quotation as any).currency || 'LKR',
            items,
        } as any);
    }

    async findAll(): Promise<Invoice[]> {
        return this.invoiceRepository.find({
            relations: ['customer', 'items'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: ['customer', 'customer.contacts', 'customer.emails', 'items', 'items.service', 'payments'],
        });
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }

    async findUpcoming(days: number = 7): Promise<Invoice[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        futureDate.setHours(23, 59, 59, 999);

        // Get recurring invoices with nextInvoiceDate within range
        const recurringInvoices = await this.invoiceRepository.find({
            where: {
                isRecurring: true,
                nextInvoiceDate: LessThanOrEqual(futureDate),
            },
            relations: ['customer'],
            order: { nextInvoiceDate: 'ASC' },
        });

        // Get overdue invoices
        const overdueInvoices = await this.invoiceRepository.find({
            where: {
                status: InvoiceStatus.OVERDUE,
            },
            relations: ['customer'],
            order: { dueDate: 'ASC' },
        });

        // Get invoices due within the next N days (not paid, not draft)
        const upcomingDueInvoices = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.customer', 'customer')
            .where('invoice.dueDate >= :today', { today })
            .andWhere('invoice.dueDate <= :futureDate', { futureDate })
            .andWhere('invoice.status NOT IN (:...excludedStatuses)', {
                excludedStatuses: [InvoiceStatus.PAID, InvoiceStatus.DRAFT]
            })
            .orderBy('invoice.dueDate', 'ASC')
            .getMany();

        // Combine and deduplicate by ID
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

        // Sort by due date or next invoice date
        return allInvoices.sort((a, b) => {
            const dateA = a.dueDate || a.nextInvoiceDate || new Date();
            const dateB = b.dueDate || b.nextInvoiceDate || new Date();
            return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
    }

    async generateRecurringInvoice(parentInvoiceId: string): Promise<Invoice> {
        const parentInvoice = await this.findOne(parentInvoiceId);

        if (!parentInvoice.isRecurring) {
            throw new BadRequestException('Invoice is not set for recurring');
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
            currency: (parentInvoice as any).currency || 'LKR',
        } as any);

        newInvoice.parentInvoiceId = parentInvoice.id;
        await this.invoiceRepository.save(newInvoice);

        // Update parent invoice's next date
        parentInvoice.lastInvoiceDate = new Date();
        parentInvoice.nextInvoiceDate = this.calculateNextInvoiceDate(
            new Date(),
            parentInvoice.frequency,
        );
        await this.invoiceRepository.save(parentInvoice);

        return newInvoice;
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
        const invoice = await this.findOne(id);

        // Removed check to allow updating paid invoices
        // if (invoice.status === InvoiceStatus.PAID) {
        //     throw new BadRequestException('Cannot update a paid invoice');
        // }

        if (updateInvoiceDto.items) {
            await this.itemRepository.delete({ invoiceId: id });

            const items = updateInvoiceDto.items.map((item) => {
                const total = item.quantity * item.unitPrice;
                return this.itemRepository.create({ ...item, invoiceId: id, total });
            });

            await this.itemRepository.save(items);

            // Recalculate total including tax
            const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
            let total = subtotal;
            const taxRate = Number(invoice.taxPercentage) || 0;
            if (taxRate > 0) {
                const taxAmount = subtotal * (taxRate / 100);
                total = subtotal + taxAmount;
            }
            invoice.total = total;
        }

        if (updateInvoiceDto.dueDate) invoice.dueDate = new Date(updateInvoiceDto.dueDate);
        if (updateInvoiceDto.notes) invoice.notes = updateInvoiceDto.notes;
        if ((updateInvoiceDto as any).currency) (invoice as any).currency = (updateInvoiceDto as any).currency;

        // Handle manual amountPaid update
        if (updateInvoiceDto.amountPaid !== undefined) {
            invoice.amountPaid = Number(updateInvoiceDto.amountPaid);

            // Recalculate status based on new amount paid
            if (invoice.amountPaid >= invoice.total) {
                invoice.status = InvoiceStatus.PAID;
            } else if (invoice.amountPaid > 0) {
                invoice.status = InvoiceStatus.PARTIAL;
            } else {
                invoice.status = InvoiceStatus.SENT; // or whatever fallback
            }
        } else if (updateInvoiceDto.status) {
            // Only update status manually if amountPaid wasn't updated (to avoid conflict)
            invoice.status = updateInvoiceDto.status;
        }

        return this.invoiceRepository.save(invoice);
    }

    async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
        const invoice = await this.findOne(id);
        invoice.status = status;
        return this.invoiceRepository.save(invoice);
    }

    async addPayment(id: string, amount: number): Promise<Invoice> {
        const invoice = await this.findOne(id);
        invoice.amountPaid = Number(invoice.amountPaid) + amount;

        if (invoice.amountPaid >= invoice.total) {
            invoice.status = InvoiceStatus.PAID;
        } else if (invoice.amountPaid > 0) {
            invoice.status = InvoiceStatus.PARTIAL;
        }

        return this.invoiceRepository.save(invoice);
    }

    async remove(id: string): Promise<void> {
        const invoice = await this.findOne(id);
        if (invoice.status === InvoiceStatus.PAID) {
            throw new BadRequestException('Cannot delete a paid invoice');
        }
        await this.invoiceRepository.remove(invoice);
    }
}
