export declare enum Currency {
    LKR = "LKR",
    USD = "USD"
}
export declare class Service {
    id: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    currency: Currency;
    deliveryTime: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
