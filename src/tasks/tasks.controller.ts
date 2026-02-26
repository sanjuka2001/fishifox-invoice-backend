import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../users/entities/user.entity';
import { TaskStatus } from './entities/task.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new task' })
    create(@Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(createTaskDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all tasks' })
    findAll() {
        return this.tasksService.findAll();
    }

    @Get('my-tasks')
    @ApiOperation({ summary: 'Get tasks assigned to current user' })
    getMyTasks(@CurrentUser('id') userId: string) {
        return this.tasksService.findByUser(userId);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get tasks for a project' })
    findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
        return this.tasksService.findByProject(projectId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Post(':id/status/:status')
    @ApiOperation({ summary: 'Update task status' })
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('status') status: TaskStatus,
    ) {
        return this.tasksService.updateStatus(id, status);
    }

    @Post(':id/log-time')
    @ApiOperation({ summary: 'Log time to task' })
    logTime(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('hours') hours: number,
    ) {
        return this.tasksService.logTime(id, hours);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a task' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.tasksService.remove(id);
    }
}
