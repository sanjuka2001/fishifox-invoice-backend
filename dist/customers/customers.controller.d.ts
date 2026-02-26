import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { PdfService } from '../common/services/pdf.service';
import type { Response } from 'express';
export declare class CustomersController {
    private readonly customersService;
    private readonly pdfService;
    constructor(customersService: CustomersService, pdfService: PdfService);
    create(createCustomerDto: CreateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    findAll(): Promise<import("./entities/customer.entity").Customer[]>;
    findOne(id: string): Promise<import("./entities/customer.entity").Customer>;
    generatePdf(id: string, res: Response): Promise<void>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    remove(id: string): Promise<void>;
}
