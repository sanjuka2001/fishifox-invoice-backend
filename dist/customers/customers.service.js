"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const customer_email_entity_1 = require("./entities/customer-email.entity");
const contact_person_entity_1 = require("./entities/contact-person.entity");
let CustomersService = class CustomersService {
    customerRepository;
    emailRepository;
    contactRepository;
    constructor(customerRepository, emailRepository, contactRepository) {
        this.customerRepository = customerRepository;
        this.emailRepository = emailRepository;
        this.contactRepository = contactRepository;
    }
    async create(createCustomerDto) {
        const { contacts, emails, ...customerData } = createCustomerDto;
        const customer = this.customerRepository.create(customerData);
        await this.customerRepository.save(customer);
        if (contacts && contacts.length > 0) {
            const contactPersons = contacts.map((contactDto, index) => this.contactRepository.create({
                ...contactDto,
                customerId: customer.id,
                isPrimary: contactDto.isPrimary ?? index === 0,
            }));
            await this.contactRepository.save(contactPersons);
            customer.contacts = contactPersons;
        }
        if (emails && emails.length > 0) {
            const customerEmails = emails.map((emailDto, index) => this.emailRepository.create({
                ...emailDto,
                customerId: customer.id,
                isPrimary: emailDto.isPrimary ?? index === 0,
            }));
            await this.emailRepository.save(customerEmails);
            customer.emails = customerEmails;
        }
        return customer;
    }
    async findAll() {
        return this.customerRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['contacts', 'emails'],
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }
    async update(id, updateCustomerDto) {
        const customer = await this.findOne(id);
        const { contacts, emails, ...customerData } = updateCustomerDto;
        Object.assign(customer, customerData);
        await this.customerRepository.save(customer);
        if (contacts) {
            await this.contactRepository.delete({ customerId: id });
            const contactPersons = contacts.map((contactDto, index) => this.contactRepository.create({
                ...contactDto,
                customerId: id,
                isPrimary: contactDto.isPrimary ?? index === 0,
            }));
            await this.contactRepository.save(contactPersons);
            customer.contacts = contactPersons;
        }
        if (emails) {
            await this.emailRepository.delete({ customerId: id });
            const customerEmails = emails.map((emailDto, index) => this.emailRepository.create({
                ...emailDto,
                customerId: id,
                isPrimary: emailDto.isPrimary ?? index === 0,
            }));
            await this.emailRepository.save(customerEmails);
            customer.emails = customerEmails;
        }
        return customer;
    }
    async remove(id) {
        const customer = await this.findOne(id);
        customer.isActive = false;
        await this.customerRepository.save(customer);
    }
    async getPrimaryContact(customerId) {
        const contact = await this.contactRepository.findOne({
            where: { customerId, isPrimary: true },
        });
        return contact || null;
    }
    async getPrimaryEmail(customerId) {
        const email = await this.emailRepository.findOne({
            where: { customerId, isPrimary: true },
        });
        return email?.email || null;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_email_entity_1.CustomerEmail)),
    __param(2, (0, typeorm_1.InjectRepository)(contact_person_entity_1.ContactPerson)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map