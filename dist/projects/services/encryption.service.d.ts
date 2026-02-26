import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private readonly algorithm;
    private readonly key;
    constructor(configService: ConfigService);
    encrypt(data: string): string;
    decrypt(encryptedData: string): string;
}
