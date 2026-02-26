import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerEmail } from '../customers/entities/customer-email.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { QuotationItem } from '../quotations/entities/quotation-item.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ProjectDocument } from '../projects/entities/project-document.entity';
import { ProjectVault } from '../projects/entities/project-vault.entity';
import { ServiceReminder } from '../projects/entities/service-reminder.entity';
import { Service } from '../services/entities/service.entity';

dotenv.config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'fishifox',
    entities: [
        User, Task, Project, Customer, CustomerEmail,
        Quotation, QuotationItem, Invoice, InvoiceItem,
        Payment, ProjectDocument, ProjectVault,
        ServiceReminder, Service
    ],
    synchronize: false, // Don't sync, just insert
});

async function seed() {
    try {
        await dataSource.initialize();
        console.log('Database connected for seeding...');

        const userRepository = dataSource.getRepository(User);

        // check if admin exists
        const adminExists = await userRepository.findOne({ where: { email: 'admin@fishifox.com' } });
        if (adminExists) {
            console.log('Admin user already exists.');
        } else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const admin = userRepository.create({
                email: 'admin@fishifox.com',
                password: hashedPassword,
                name: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
            });
            await userRepository.save(admin);
            console.log('Admin user created successfully.');
        }

        // check if staff exists
        const staffExists = await userRepository.findOne({ where: { email: 'staff@fishifox.com' } });
        if (staffExists) {
            console.log('Staff user already exists.');
        } else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const staff = userRepository.create({
                email: 'staff@fishifox.com',
                password: hashedPassword,
                name: 'Staff User',
                role: UserRole.STAFF,
                isActive: true,
            });
            await userRepository.save(staff);
            console.log('Staff user created successfully.');
        }

        await dataSource.destroy();
        console.log('Seeding complete.');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
