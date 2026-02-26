import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsService {
    private readonly settingsRepository;
    constructor(settingsRepository: Repository<CompanySettings>);
    getSettings(): Promise<CompanySettings>;
    updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<CompanySettings>;
}
