import { Customer } from './customer.entity';
export declare class CustomerEmail {
    id: string;
    email: string;
    isPrimary: boolean;
    customer: Customer;
    customerId: string;
}
