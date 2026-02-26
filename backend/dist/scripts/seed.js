"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
const task_entity_1 = require("../tasks/entities/task.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const customer_email_entity_1 = require("../customers/entities/customer-email.entity");
const quotation_entity_1 = require("../quotations/entities/quotation.entity");
const quotation_item_entity_1 = require("../quotations/entities/quotation-item.entity");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
const invoice_item_entity_1 = require("../invoices/entities/invoice-item.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const project_document_entity_1 = require("../projects/entities/project-document.entity");
const project_vault_entity_1 = require("../projects/entities/project-vault.entity");
const service_reminder_entity_1 = require("../projects/entities/service-reminder.entity");
const service_entity_1 = require("../services/entities/service.entity");
dotenv.config();
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'fishifox',
    entities: [
        user_entity_1.User, task_entity_1.Task, project_entity_1.Project, customer_entity_1.Customer, customer_email_entity_1.CustomerEmail,
        quotation_entity_1.Quotation, quotation_item_entity_1.QuotationItem, invoice_entity_1.Invoice, invoice_item_entity_1.InvoiceItem,
        payment_entity_1.Payment, project_document_entity_1.ProjectDocument, project_vault_entity_1.ProjectVault,
        service_reminder_entity_1.ServiceReminder, service_entity_1.Service
    ],
    synchronize: false,
});
async function seed() {
    try {
        await dataSource.initialize();
        console.log('Database connected for seeding...');
        const userRepository = dataSource.getRepository(user_entity_1.User);
        const adminExists = await userRepository.findOne({ where: { email: 'admin@fishifox.com' } });
        if (adminExists) {
            console.log('Admin user already exists.');
        }
        else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const admin = userRepository.create({
                email: 'admin@fishifox.com',
                password: hashedPassword,
                name: 'Admin User',
                role: user_entity_1.UserRole.ADMIN,
                isActive: true,
            });
            await userRepository.save(admin);
            console.log('Admin user created successfully.');
        }
        const staffExists = await userRepository.findOne({ where: { email: 'staff@fishifox.com' } });
        if (staffExists) {
            console.log('Staff user already exists.');
        }
        else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const staff = userRepository.create({
                email: 'staff@fishifox.com',
                password: hashedPassword,
                name: 'Staff User',
                role: user_entity_1.UserRole.STAFF,
                isActive: true,
            });
            await userRepository.save(staff);
            console.log('Staff user created successfully.');
        }
        await dataSource.destroy();
        console.log('Seeding complete.');
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map