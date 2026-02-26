import { CreateInvoiceDto } from './create-invoice.dto';
import { InvoiceStatus } from '../entities/invoice.entity';
declare const UpdateInvoiceDto_base: import("@nestjs/common").Type<Partial<CreateInvoiceDto>>;
export declare class UpdateInvoiceDto extends UpdateInvoiceDto_base {
    status?: InvoiceStatus;
    amountPaid?: number;
}
export {};
