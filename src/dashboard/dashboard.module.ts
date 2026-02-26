import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ServiceReminder } from '../projects/entities/service-reminder.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice, Payment, ServiceReminder, Task])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
