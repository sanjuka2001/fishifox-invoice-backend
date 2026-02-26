import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    Query,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PdfService } from '../common/services/pdf.service';
import { CreatePaymentDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly pdfService: PdfService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Record a new payment' })
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all payments' })
    findAll() {
        return this.paymentsService.findAll();
    }

    @Get('by-date-range')
    @ApiOperation({ summary: 'Get payments by date range' })
    @ApiQuery({ name: 'startDate', type: String })
    @ApiQuery({ name: 'endDate', type: String })
    findByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.paymentsService.findByDateRange(
            new Date(startDate),
            new Date(endDate),
        );
    }

    @Get('invoice/:invoiceId')
    @ApiOperation({ summary: 'Get payments for an invoice' })
    findByInvoice(@Param('invoiceId', ParseUUIDPipe) invoiceId: string) {
        return this.paymentsService.findByInvoice(invoiceId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a payment by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.paymentsService.findOne(id);
    }

    @Post('receipt-pdf')
    @ApiOperation({ summary: 'Generate payment receipt PDF from data' })
    async generateReceiptPdf(
        @Body() paymentData: any,
        @Res() res: Response,
    ) {
        const buffer = await this.pdfService.generatePaymentPdf(paymentData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=payment-${paymentData.id || 'receipt'}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a payment' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.paymentsService.remove(id);
    }
}
