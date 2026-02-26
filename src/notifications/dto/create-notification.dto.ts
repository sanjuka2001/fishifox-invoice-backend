import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
    @IsString()
    message: string;

    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @IsString()
    @IsOptional()
    relatedTaskId?: string;

    @IsString()
    @IsOptional()
    completedByUserId?: string;

    @IsString()
    @IsOptional()
    forUserId?: string;
}
