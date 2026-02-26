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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';
import { PdfService } from '../common/services/pdf.service';
import type { Response } from 'express';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly pdfService: PdfService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new customer' })
    create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all customers' })
    findAll() {
        return this.customersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a customer by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.customersService.findOne(id);
    }

    @Get(':id/pdf')
    @ApiOperation({ summary: 'Generate PDF for customer' })
    async generatePdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
        const customer = await this.customersService.findOne(id);
        const pdfBuffer = await this.pdfService.generateCustomerPdf(customer);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="customer-${customer.companyName.replace(/\s+/g, '-')}.pdf"`,
        });
        res.send(pdfBuffer);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a customer' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a customer' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.customersService.remove(id);
    }
}
