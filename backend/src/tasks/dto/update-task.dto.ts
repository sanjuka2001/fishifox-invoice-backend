import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsNumber()
    @Min(0)
    @IsOptional()
    hoursTracked?: number;
}
