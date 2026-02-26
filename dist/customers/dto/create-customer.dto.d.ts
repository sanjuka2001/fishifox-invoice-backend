export declare class CustomerEmailDto {
    email: string;
    isPrimary?: boolean;
}
export declare class ContactPersonDto {
    name: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
}
export declare class CreateCustomerDto {
    companyName: string;
    address?: string;
    contacts: ContactPersonDto[];
    emails?: CustomerEmailDto[];
}
