import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<import("./entities/company-settings.entity").CompanySettings>;
    updateSettings(updateSettingsDto: UpdateSettingsDto, file: Express.Multer.File): Promise<import("./entities/company-settings.entity").CompanySettings>;
}
