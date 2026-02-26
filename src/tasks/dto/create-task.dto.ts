import {
    IsString,
    IsOptional,
    IsUUID,
    IsEnum,
    IsNumber,
    IsDateString,
    Min,
} from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
    @IsUUID()
    projectId: string;

    @IsUUID()
    @IsOptional()
    assignedToId?: string;

    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsNumber()
    @Min(0)
    @IsOptional()
    cost?: number;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsNumber()
    @IsOptional()
    priority?: number;
}
