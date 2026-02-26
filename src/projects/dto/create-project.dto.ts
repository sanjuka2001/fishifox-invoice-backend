import {
    IsString,
    IsOptional,
    IsUUID,
    IsEnum,
} from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    customerId: string;

    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;
}
