import { Customer } from './customer.entity';
export declare class ContactPerson {
    id: string;
    name: string;
    phone: string;
    email: string;
    isPrimary: boolean;
    customer: Customer;
    customerId: string;
}
