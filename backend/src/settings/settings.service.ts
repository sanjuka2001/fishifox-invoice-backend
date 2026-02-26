import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(CompanySettings)
        private readonly settingsRepository: Repository<CompanySettings>,
    ) { }

    async getSettings(): Promise<CompanySettings> {
        const settings = await this.settingsRepository.find();
        if (settings.length > 0) {
            return settings[0];
        }

        // Create default settings if none exist
        const defaultSettings = this.settingsRepository.create({
            companyName: 'Fishifox IT Services',
            taxPercentage: 0,
        });

        return this.settingsRepository.save(defaultSettings);
    }

    async updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<CompanySettings> {
        const settings = await this.getSettings();

        Object.assign(settings, updateSettingsDto);

        return this.settingsRepository.save(settings);
    }
}
