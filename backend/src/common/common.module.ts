import { Module } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [SettingsModule],
    providers: [PdfService],
    exports: [PdfService],
})
export class CommonModule { }
