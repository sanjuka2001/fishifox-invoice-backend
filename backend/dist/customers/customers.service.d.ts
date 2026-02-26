import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerEmail } from './entities/customer-email.entity';
import { ContactPerson } from './entities/contact-person.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
export declare class CustomersService {
    private readonly customerRepository;
    private readonly emailRepository;
    private readonly contactRepository;
    constructor(customerRepository: Repository<Customer>, emailRepository: Repository<CustomerEmail>, contactRepository: Repository<ContactPerson>);
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findAll(): Promise<Customer[]>;
    findOne(id: string): Promise<Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer>;
    remove(id: string): Promise<void>;
    getPrimaryContact(customerId: string): Promise<ContactPerson | null>;
    getPrimaryEmail(customerId: string): Promise<string | null>;
}
