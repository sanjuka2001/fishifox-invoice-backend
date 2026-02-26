import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { ServiceReminder } from '../projects/entities/service-reminder.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CustomersModule } from '../customers/customers.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([ServiceReminder, Invoice]),
        CustomersModule,
    ],
    controllers: [SchedulerController],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
