import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority, TaskStatus } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new task',
    description:
      'Creates a new task linked to an existing project. The project must exist.',
  })
  @ApiCreatedResponse({
    description: 'Task created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
          title: 'Design new landing page mockup',
          description: 'Create Figma mockups based on brand guidelines',
          status: 'todo',
          priority: 'high',
          dueDate: '2024-02-28',
          projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          createdAt: '2024-01-15T09:00:00.000Z',
          updatedAt: '2024-01-15T09:00:00.000Z',
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks',
    description:
      'Returns all tasks. Supports filtering by status, priority, projectId, and title search.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Filter by task status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: TaskPriority,
    description: 'Filter by task priority',
  })
  @ApiQuery({
    name: 'projectId',
    required: false,
    type: String,
    description: 'Filter by project UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search tasks by title (case-insensitive partial match)',
    example: 'mockup',
  })
  @ApiOkResponse({
    description: 'List of tasks',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
            title: 'Design new landing page mockup',
            status: 'in_progress',
            priority: 'high',
            dueDate: '2024-02-28',
            projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            project: {
              id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              name: 'Website Redesign',
            },
            createdAt: '2024-01-15T09:00:00.000Z',
            updatedAt: '2024-01-16T14:00:00.000Z',
          },
        ],
        timestamp: '2024-01-16T14:00:00.000Z',
      },
    },
  })
  findAll(@Query() query: QueryTaskDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a task by ID',
    description: 'Returns a single task with its associated project info.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Task found' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description: `
Partially updates a task. All fields are optional.

**Note:** \`projectId\` cannot be changed after creation.

**Status Transition Rules:**
| From | Allowed transitions |
|------|-------------------|
| \`todo\` | \`in_progress\`, \`cancelled\` |
| \`in_progress\` | \`in_review\`, \`todo\`, \`cancelled\` |
| \`in_review\` | \`done\`, \`in_progress\`, \`cancelled\` |
| \`done\` | *(terminal — no transitions)* |
| \`cancelled\` | *(terminal — no transitions)* |
    `.trim(),
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ description: 'Task updated successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid status transition',
    schema: {
      example: {
        statusCode: 400,
        timestamp: '2024-01-15T09:00:00.000Z',
        path: '/api/v1/tasks/f1e2d3c4-b5a6-7890-fedc-ba9876543210',
        method: 'PATCH',
        message:
          'Cannot transition task from "todo" to "done". Allowed transitions: in_progress, cancelled',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Quick-update task status',
    description:
      'Shortcut endpoint to update only the status field. Same transition rules apply.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
    format: 'uuid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: Object.values(TaskStatus),
          example: TaskStatus.IN_PROGRESS,
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Task status updated' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Permanently deletes a task.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task UUID',
    example: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Task deleted successfully',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Task "Design new landing page mockup" deleted successfully',
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
