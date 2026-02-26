import { CreateQuotationDto } from './create-quotation.dto';
import { QuotationStatus } from '../entities/quotation.entity';
declare const UpdateQuotationDto_base: import("@nestjs/common").Type<Partial<CreateQuotationDto>>;
export declare class UpdateQuotationDto extends UpdateQuotationDto_base {
    status?: QuotationStatus;
}
export {};
