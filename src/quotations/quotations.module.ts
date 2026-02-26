import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CustomersModule } from '../customers/customers.module';
import { CommonModule } from '../common/common.module';
import { SettingsModule } from '../settings/settings.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Quotation, QuotationItem, Invoice]),
        CustomersModule,
        forwardRef(() => InvoicesModule),
        CommonModule,
        SettingsModule,
    ],
    controllers: [QuotationsController],
    providers: [QuotationsService],
    exports: [QuotationsService],
})
export class QuotationsModule { }
