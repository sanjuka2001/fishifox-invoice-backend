import { Currency } from '../entities/service.entity';
export declare class CreateServiceDto {
    name: string;
    description?: string;
    price: number;
    cost?: number;
    currency?: Currency;
    deliveryTime?: string;
}
