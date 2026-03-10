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
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({ description: 'Task created' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks (paginated)',
    description: `
Supports **pagination**, **filtering** by multiple fields, **date range**, and **sorting**.

**Example queries:**
- \`?page=1&limit=10\` — first 10 tasks
- \`?status=todo&priority=high\` — filter by status and priority
- \`?projectId=uuid&sortBy=dueDate&sortOrder=ASC\` — tasks of a project sorted by due date
- \`?dueDateFrom=2024-01-01&dueDateTo=2024-03-31\` — tasks due in Q1 2024
- \`?search=mockup&status=in_progress\` — search + filter combined
    `.trim(),
  })
  @ApiOkResponse({
    description: 'Paginated list of tasks',
    schema: {
      example: {
        success: true,
        data: {
          data: [
            {
              id: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
              title: 'Design landing page mockup',
              status: 'in_progress',
              priority: 'high',
              dueDate: '2024-02-28',
              projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              project: { id: 'a1b2c3d4-...', name: 'Website Redesign' },
              createdAt: '2024-01-15T09:00:00.000Z',
            },
          ],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 38,
            totalPages: 4,
            hasPreviousPage: false,
            hasNextPage: true,
          },
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  findAll(@Query() query: QueryTaskDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Task found' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (status transition rules apply)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ description: 'Task updated' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Quick-update task status' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: Object.values(TaskStatus) },
      },
    },
  })
  @ApiOkResponse({ description: 'Status updated' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Task deleted' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
