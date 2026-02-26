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
    BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';
import { QuotationStatus } from './entities/quotation.entity';
import { PdfService } from '../common/services/pdf.service';
import { MailService } from '../mail/mail.service';

@ApiTags('quotations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quotations')
export class QuotationsController {
    constructor(
        private readonly quotationsService: QuotationsService,
        private readonly pdfService: PdfService,
        private readonly mailService: MailService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new quotation' })
    create(@Body() createQuotationDto: CreateQuotationDto) {
        return this.quotationsService.create(createQuotationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all quotations' })
    findAll() {
        return this.quotationsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a quotation by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.quotationsService.findOne(id);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Generate PDF for quotation' })
    async generatePdf(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('preview') preview: string,
        @Res() res: Response,
    ) {
        const quotation = await this.quotationsService.findOne(id);
        const pdfBuffer = await this.pdfService.generateQuotationPdf(quotation);

        // Use inline for preview, attachment for download
        const disposition = preview === 'true' ? 'inline' : 'attachment';
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${disposition}; filename="quotation-${quotation.quoteNumber}.pdf"`,
        });
        res.send(pdfBuffer);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a quotation' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateQuotationDto: UpdateQuotationDto,
    ) {
        return this.quotationsService.update(id, updateQuotationDto);
    }

    @Post(':id/approve')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Approve quotation and convert to invoice' })
    async approve(@Param('id', ParseUUIDPipe) id: string) {
        return this.quotationsService.updateStatus(id, QuotationStatus.APPROVED);
    }

    @Post(':id/send')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Send quotation email to customer' })
    async send(@Param('id', ParseUUIDPipe) id: string) {
        // Get quotation with customer relationship
        console.log('Fetching quotation:', id);
        const quotation = await this.quotationsService.findOne(id);
        console.log('Quotation found:', quotation.quoteNumber);
        console.log('Customer:', quotation.customer?.companyName);
        console.log('Customer contacts:', quotation.customer?.contacts?.length || 0);
        console.log('Customer emails:', quotation.customer?.emails?.length || 0);

        // Get customer email - use first contact email or first customer email
        let customerEmail: string | null = null;
        if (quotation.customer?.contacts?.length > 0) {
            customerEmail = quotation.customer.contacts[0].email;
        } else if (quotation.customer?.emails?.length > 0) {
            customerEmail = quotation.customer.emails[0].email;
        }

        console.log('Customer email:', customerEmail);

        if (!customerEmail) {
            throw new BadRequestException('Customer does not have an email address');
        }

        // Generate PDF
        console.log('Generating PDF...');
        const pdfBuffer = await this.pdfService.generateQuotationPdf(quotation);
        console.log('PDF generated, size:', pdfBuffer.length);

        // Send email with PDF attachment
        try {
            console.log('Sending email to:', customerEmail);
            await this.mailService.sendQuotationEmail(
                customerEmail,
                quotation.customer.companyName,
                quotation.quoteNumber,
                pdfBuffer,
            );
            console.log('Email sent successfully!');
        } catch (emailError: any) {
            console.error('Email sending failed:', emailError.message);
            throw new BadRequestException(
                `Failed to send email: ${emailError.message || 'Unknown email error'}. Please check your SMTP configuration.`
            );
        }

        // Update status to SENT
        return this.quotationsService.updateStatus(id, QuotationStatus.SENT);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a quotation' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.quotationsService.remove(id);
    }
}
