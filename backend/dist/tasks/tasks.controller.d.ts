import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TaskStatus } from './entities/task.entity';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto): Promise<import("./entities/task.entity").Task>;
    findAll(): Promise<import("./entities/task.entity").Task[]>;
    getMyTasks(userId: string): Promise<import("./entities/task.entity").Task[]>;
    findByProject(projectId: string): Promise<import("./entities/task.entity").Task[]>;
    findOne(id: string): Promise<import("./entities/task.entity").Task>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<import("./entities/task.entity").Task>;
    updateStatus(id: string, status: TaskStatus): Promise<import("./entities/task.entity").Task>;
    logTime(id: string, hours: number): Promise<import("./entities/task.entity").Task>;
    remove(id: string): Promise<void>;
}
