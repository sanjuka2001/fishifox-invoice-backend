"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let TasksService = class TasksService {
    taskRepository;
    notificationsService;
    constructor(taskRepository, notificationsService) {
        this.taskRepository = taskRepository;
        this.notificationsService = notificationsService;
    }
    async create(createTaskDto) {
        const task = this.taskRepository.create({
            ...createTaskDto,
            dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
        });
        return this.taskRepository.save(task);
    }
    async findAll() {
        return this.taskRepository.find({
            relations: ['project', 'assignedTo'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByProject(projectId) {
        return this.taskRepository.find({
            where: { projectId },
            relations: ['assignedTo'],
            order: { priority: 'DESC', createdAt: 'DESC' },
        });
    }
    async findByUser(userId) {
        return this.taskRepository.find({
            where: { assignedToId: userId },
            relations: ['project'],
            order: { priority: 'DESC', dueDate: 'ASC' },
        });
    }
    async findOne(id) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['project', 'assignedTo'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async update(id, updateTaskDto) {
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
        if (previousStatus !== task_entity_1.TaskStatus.COMPLETED && savedTask.status === task_entity_1.TaskStatus.COMPLETED) {
            const completedByName = savedTask.assignedTo?.name || 'Unknown user';
            const completedByUserId = savedTask.assignedToId || '';
            await this.notificationsService.createTaskCompletedNotification(savedTask.title, savedTask.id, completedByUserId, completedByName);
        }
        return savedTask;
    }
    async updateStatus(id, status) {
        const task = await this.findOne(id);
        const previousStatus = task.status;
        task.status = status;
        const savedTask = await this.taskRepository.save(task);
        if (previousStatus !== task_entity_1.TaskStatus.COMPLETED && status === task_entity_1.TaskStatus.COMPLETED) {
            const completedByName = savedTask.assignedTo?.name || 'Unknown user';
            const completedByUserId = savedTask.assignedToId || '';
            await this.notificationsService.createTaskCompletedNotification(savedTask.title, savedTask.id, completedByUserId, completedByName);
        }
        return savedTask;
    }
    async logTime(id, hours) {
        const task = await this.findOne(id);
        task.hoursTracked = Number(task.hoursTracked) + hours;
        return this.taskRepository.save(task);
    }
    async remove(id) {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
    }
    async getProjectTaskCost(projectId) {
        const result = await this.taskRepository
            .createQueryBuilder('task')
            .select('SUM(task.cost)', 'total')
            .where('task.projectId = :projectId', { projectId })
            .getRawOne();
        return Number(result?.total) || 0;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map