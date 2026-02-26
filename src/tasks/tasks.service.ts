import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const task = this.taskRepository.create({
            ...createTaskDto,
            dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
        });
        return this.taskRepository.save(task);
    }

    async findAll(): Promise<Task[]> {
        return this.taskRepository.find({
            relations: ['project', 'assignedTo'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByProject(projectId: string): Promise<Task[]> {
        return this.taskRepository.find({
            where: { projectId },
            relations: ['assignedTo'],
            order: { priority: 'DESC', createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Task[]> {
        return this.taskRepository.find({
            where: { assignedToId: userId },
            relations: ['project'],
            order: { priority: 'DESC', dueDate: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['project', 'assignedTo'],
        });
        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }

    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const task = await this.findOne(id);
        const previousStatus = task.status;

        if (updateTaskDto.dueDate) {
            task.dueDate = new Date(updateTaskDto.dueDate);
        }

        Object.assign(task, {
            ...updateTaskDto,
            dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
        });

        const savedTask = await this.taskRepository.save(task);

        // Notify admins if task was just completed
        if (previousStatus !== TaskStatus.COMPLETED && savedTask.status === TaskStatus.COMPLETED) {
            const completedByName = savedTask.assignedTo?.name || 'Unknown user';
            const completedByUserId = savedTask.assignedToId || '';
            await this.notificationsService.createTaskCompletedNotification(
                savedTask.title,
                savedTask.id,
                completedByUserId,
                completedByName,
            );
        }

        return savedTask;
    }

    async updateStatus(id: string, status: TaskStatus): Promise<Task> {
        const task = await this.findOne(id);
        const previousStatus = task.status;
        task.status = status;
        const savedTask = await this.taskRepository.save(task);

        // Notify admins if task was just completed
        if (previousStatus !== TaskStatus.COMPLETED && status === TaskStatus.COMPLETED) {
            const completedByName = savedTask.assignedTo?.name || 'Unknown user';
            const completedByUserId = savedTask.assignedToId || '';
            await this.notificationsService.createTaskCompletedNotification(
                savedTask.title,
                savedTask.id,
                completedByUserId,
                completedByName,
            );
        }

        return savedTask;
    }

    async logTime(id: string, hours: number): Promise<Task> {
        const task = await this.findOne(id);
        task.hoursTracked = Number(task.hoursTracked) + hours;
        return this.taskRepository.save(task);
    }

    async remove(id: string): Promise<void> {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
    }

    async getProjectTaskCost(projectId: string): Promise<number> {
        const result = await this.taskRepository
            .createQueryBuilder('task')
            .select('SUM(task.cost)', 'total')
            .where('task.projectId = :projectId', { projectId })
            .getRawOne();

        return Number(result?.total) || 0;
    }
}
