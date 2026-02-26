import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    Res,
    Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';
import { InvoiceStatus } from './entities/invoice.entity';
import { PdfService } from '../common/services/pdf.service';
import { MailService } from '../mail/mail.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService,
        private readonly pdfService: PdfService,
        private readonly mailService: MailService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new invoice' })
    create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }

    @Post('from-quotation/:quotationId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create invoice from approved quotation' })
    async createFromQuotation(@Param('quotationId', ParseUUIDPipe) quotationId: string) {
        try {
            console.log('Creating invoice from quotation:', quotationId);
            const invoice = await this.invoicesService.createFromQuotation(quotationId);
            console.log('Invoice created successfully:', invoice.invoiceNumber);
            return invoice;
        } catch (error: any) {
            console.error('Failed to create invoice from quotation:', error.message);
            console.error('Full error:', error);
            throw error;
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all invoices' })
    findAll() {
        return this.invoicesService.findAll();
    }

    @Get('upcoming')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get upcoming recurring invoices' })
    @ApiQuery({ name: 'days', required: false, type: Number })
    findUpcoming(@Query('days') days?: number) {
        return this.invoicesService.findUpcoming(days || 30);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an invoice by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.invoicesService.findOne(id);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Generate PDF for invoice' })
    async generatePdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
        const invoice = await this.invoicesService.findOne(id);
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        });
        res.send(pdfBuffer);
    }

    @Post(':id/generate-recurring')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Generate next recurring invoice' })
    generateRecurring(@Param('id', ParseUUIDPipe) id: string) {
        return this.invoicesService.generateRecurringInvoice(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update an invoice' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateInvoiceDto: UpdateInvoiceDto,
    ) {
        return this.invoicesService.update(id, updateInvoiceDto);
    }

    @Post(':id/send')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Send invoice email to customer' })
    async send(@Param('id', ParseUUIDPipe) id: string) {
        // Get invoice with customer relationship
        const invoice = await this.invoicesService.findOne(id);

        // Get customer email - use first contact email or first customer email
        let customerEmail: string | null = null;
        if (invoice.customer?.contacts?.length > 0) {
            customerEmail = invoice.customer.contacts[0].email;
        } else if (invoice.customer?.emails?.length > 0) {
            customerEmail = invoice.customer.emails[0].email;
        }

        if (!customerEmail) {
            throw new Error('Customer does not have an email address');
        }

        // Generate PDF
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

        // Send email with PDF attachment
        await this.mailService.sendInvoiceEmail(
            customerEmail,
            invoice.customer.companyName,
            invoice.invoiceNumber,
            pdfBuffer,
        );

        // Update status to SENT
        return this.invoicesService.updateStatus(id, InvoiceStatus.SENT);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete an invoice' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.invoicesService.remove(id);
    }
}
