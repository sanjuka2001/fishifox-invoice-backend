import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerEmail } from './entities/customer-email.entity';
import { ContactPerson } from './entities/contact-person.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(CustomerEmail)
        private readonly emailRepository: Repository<CustomerEmail>,
        @InjectRepository(ContactPerson)
        private readonly contactRepository: Repository<ContactPerson>,
    ) { }

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const { contacts, emails, ...customerData } = createCustomerDto;

        const customer = this.customerRepository.create(customerData);
        await this.customerRepository.save(customer);

        // Save contacts
        if (contacts && contacts.length > 0) {
            const contactPersons = contacts.map((contactDto, index) =>
                this.contactRepository.create({
                    ...contactDto,
                    customerId: customer.id,
                    isPrimary: contactDto.isPrimary ?? index === 0,
                }),
            );
            await this.contactRepository.save(contactPersons);
            customer.contacts = contactPersons;
        }

        // Keep backward compatibility for emails
        if (emails && emails.length > 0) {
            const customerEmails = emails.map((emailDto, index) =>
                this.emailRepository.create({
                    ...emailDto,
                    customerId: customer.id,
                    isPrimary: emailDto.isPrimary ?? index === 0,
                }),
            );
            await this.emailRepository.save(customerEmails);
            customer.emails = customerEmails;
        }

        return customer;
    }

    async findAll(): Promise<Customer[]> {
        return this.customerRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['contacts', 'emails'],
        });
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.findOne(id);
        const { contacts, emails, ...customerData } = updateCustomerDto;

        Object.assign(customer, customerData);
        await this.customerRepository.save(customer);

        // Update contacts
        if (contacts) {
            await this.contactRepository.delete({ customerId: id });
            const contactPersons = contacts.map((contactDto, index) =>
                this.contactRepository.create({
                    ...contactDto,
                    customerId: id,
                    isPrimary: contactDto.isPrimary ?? index === 0,
                }),
            );
            await this.contactRepository.save(contactPersons);
            customer.contacts = contactPersons;
        }

        // Update emails for backward compatibility
        if (emails) {
            await this.emailRepository.delete({ customerId: id });
            const customerEmails = emails.map((emailDto, index) =>
                this.emailRepository.create({
                    ...emailDto,
                    customerId: id,
                    isPrimary: emailDto.isPrimary ?? index === 0,
                }),
            );
            await this.emailRepository.save(customerEmails);
            customer.emails = customerEmails;
        }

        return customer;
    }

    async remove(id: string): Promise<void> {
        const customer = await this.findOne(id);
        customer.isActive = false;
        await this.customerRepository.save(customer);
    }

    async getPrimaryContact(customerId: string): Promise<ContactPerson | null> {
        const contact = await this.contactRepository.findOne({
            where: { customerId, isPrimary: true },
        });
        return contact || null;
    }

    async getPrimaryEmail(customerId: string): Promise<string | null> {
        const email = await this.emailRepository.findOne({
            where: { customerId, isPrimary: true },
        });
        return email?.email || null;
    }
}

