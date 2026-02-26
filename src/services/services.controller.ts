import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new service' })
    create(@Body() createServiceDto: CreateServiceDto) {
        return this.servicesService.create(createServiceDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all services' })
    findAll() {
        return this.servicesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a service by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.servicesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a service' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateServiceDto: UpdateServiceDto,
    ) {
        return this.servicesService.update(id, updateServiceDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a service' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.servicesService.remove(id);
    }
}
