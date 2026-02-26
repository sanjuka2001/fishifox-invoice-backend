import { IsString, IsUUID } from 'class-validator';

export class CreateVaultItemDto {
    @IsUUID()
    projectId: string;

    @IsString()
    label: string;

    @IsString()
    data: string;

    @IsString()
    notes?: string;
}
