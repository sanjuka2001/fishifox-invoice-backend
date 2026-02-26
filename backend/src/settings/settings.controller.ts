import { Controller, Get, Patch, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get company settings' })
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Patch()
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('logo', {
        storage: diskStorage({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'image/png') {
                cb(null, true);
            } else {
                cb(new Error('Only PNG images are allowed'), false);
            }
        }
    }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Update company settings' })
    updateSettings(@Body() updateSettingsDto: UpdateSettingsDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            updateSettingsDto.logoUrl = file.path;
        }
        return this.settingsService.updateSettings(updateSettingsDto);
    }
}
