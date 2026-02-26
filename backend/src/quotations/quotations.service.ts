import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreateQuotationDto, UpdateQuotationDto } from './dto';
import { CustomersService } from '../customers/customers.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class QuotationsService {
    constructor(
        @InjectRepository(Quotation)
        private readonly quotationRepository: Repository<Quotation>,
        @InjectRepository(QuotationItem)
        private readonly itemRepository: Repository<QuotationItem>,
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        private readonly customersService: CustomersService,
        private readonly settingsService: SettingsService,
    ) { }

    private async generateQuoteNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await this.quotationRepository.count();
        return `QT-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
        await this.customersService.findOne(createQuotationDto.customerId);
        const settings = await this.settingsService.getSettings();

        const quoteNumber = await this.generateQuoteNumber();

        const items = createQuotationDto.items.map((item) => {
            const total = item.quantity * item.unitPrice;
            return this.itemRepository.create({ ...item, total });
        });

        const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
        let total = subtotal;

        // Calculate tax (with null safety)
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
            currency: (createQuotationDto as any).currency || 'LKR',
            status: QuotationStatus.DRAFT,
            items,
            total,
            taxPercentage: taxRate,
        });

        return this.quotationRepository.save(quotation);
    }

    async findAll(): Promise<Quotation[]> {
        return this.quotationRepository.find({
            relations: ['customer', 'items', 'project'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Quotation> {
        const quotation = await this.quotationRepository.findOne({
            where: { id },
            relations: ['customer', 'customer.contacts', 'customer.emails', 'items', 'items.service', 'project'],
        });
        if (!quotation) {
            throw new NotFoundException(`Quotation with ID ${id} not found`);
        }
        return quotation;
    }

    async update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<Quotation> {
        const quotation = await this.findOne(id);

        if (quotation.status === QuotationStatus.APPROVED) {
            throw new BadRequestException('Cannot update an approved quotation');
        }

        if (updateQuotationDto.items) {
            await this.itemRepository.delete({ quotationId: id });

            const items = updateQuotationDto.items.map((item) => {
                const total = item.quantity * item.unitPrice;
                return this.itemRepository.create({ ...item, quotationId: id, total });
            });

            await this.itemRepository.save(items);

            // Recalculate total including tax
            const subtotal = items.reduce((sum, item) => sum + Number(item.total), 0);
            let total = subtotal;
            const taxRate = Number(quotation.taxPercentage) || 0;
            if (taxRate > 0) {
                const taxAmount = subtotal * (taxRate / 100);
                total = subtotal + taxAmount;
            }
            quotation.total = total;
        }

        if (updateQuotationDto.validUntil) quotation.validUntil = new Date(updateQuotationDto.validUntil);
        if (updateQuotationDto.notes) quotation.notes = updateQuotationDto.notes;
        if (updateQuotationDto.status) quotation.status = updateQuotationDto.status;
        if (updateQuotationDto.projectId) quotation.projectId = updateQuotationDto.projectId;
        if (updateQuotationDto.attentionTo !== undefined) quotation.attentionTo = updateQuotationDto.attentionTo;
        if ((updateQuotationDto as any).currency) (quotation as any).currency = (updateQuotationDto as any).currency;

        return this.quotationRepository.save(quotation);
    }

    async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
        const quotation = await this.findOne(id);
        quotation.status = status;
        return this.quotationRepository.save(quotation);
    }

    async remove(id: string): Promise<void> {
        const quotation = await this.findOne(id);

        // Unlink any invoices that reference this quotation
        await this.invoiceRepository.update(
            { quotationId: id },
            { quotationId: null as any }
        );

        // Delete related quotation items
        await this.itemRepository.delete({ quotationId: id });

        // Now delete the quotation
        await this.quotationRepository.remove(quotation);
    }
}
