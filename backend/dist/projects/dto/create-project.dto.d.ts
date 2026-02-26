import { ProjectStatus } from '../entities/project.entity';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    customerId: string;
    status?: ProjectStatus;
}
