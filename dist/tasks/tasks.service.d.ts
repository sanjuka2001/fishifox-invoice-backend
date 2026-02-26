import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class TasksService {
    private readonly taskRepository;
    private readonly notificationsService;
    constructor(taskRepository: Repository<Task>, notificationsService: NotificationsService);
    create(createTaskDto: CreateTaskDto): Promise<Task>;
    findAll(): Promise<Task[]>;
    findByProject(projectId: string): Promise<Task[]>;
    findByUser(userId: string): Promise<Task[]>;
    findOne(id: string): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
    updateStatus(id: string, status: TaskStatus): Promise<Task>;
    logTime(id: string, hours: number): Promise<Task>;
    remove(id: string): Promise<void>;
    getProjectTaskCost(projectId: string): Promise<number>;
}
