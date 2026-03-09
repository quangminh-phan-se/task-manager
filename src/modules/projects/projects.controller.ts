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
  ApiBody,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from './entities/project.entity';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Creates a new project. Project name must be unique.',
  })
  @ApiCreatedResponse({
    description: 'Project created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Website Redesign',
          description: 'Full redesign with new branding',
          status: 'active',
          tasks: [],
          createdAt: '2024-01-15T09:00:00.000Z',
          updatedAt: '2024-01-15T09:00:00.000Z',
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        statusCode: 400,
        timestamp: '2024-01-15T09:00:00.000Z',
        path: '/api/v1/projects',
        method: 'POST',
        message: ['name should not be empty', 'name must be a string'],
      },
    },
  })
  @ApiConflictResponse({
    description: 'A project with this name already exists',
    schema: {
      example: {
        statusCode: 409,
        timestamp: '2024-01-15T09:00:00.000Z',
        path: '/api/v1/projects',
        method: 'POST',
        message: 'Project with name "Website Redesign" already exists',
      },
    },
  })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description:
      'Returns all projects. Supports optional filtering by status and search by name.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProjectStatus,
    description: 'Filter by project status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search projects by name (case-insensitive partial match)',
    example: 'website',
  })
  @ApiOkResponse({
    description: 'List of projects',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'Website Redesign',
            description: 'Full redesign with new branding',
            status: 'active',
            taskCount: 5,
            createdAt: '2024-01-15T09:00:00.000Z',
            updatedAt: '2024-01-15T09:00:00.000Z',
          },
        ],
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a project by ID',
    description: 'Returns a single project with all its tasks.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Project found',
    schema: {
      example: {
        success: true,
        data: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Website Redesign',
          description: 'Full redesign with new branding',
          status: 'active',
          tasks: [
            {
              id: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
              title: 'Design mockup',
              status: 'in_progress',
              priority: 'high',
              dueDate: '2024-02-28',
              createdAt: '2024-01-16T09:00:00.000Z',
              updatedAt: '2024-01-16T09:00:00.000Z',
            },
          ],
          createdAt: '2024-01-15T09:00:00.000Z',
          updatedAt: '2024-01-15T09:00:00.000Z',
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Project not found',
    schema: {
      example: {
        statusCode: 404,
        timestamp: '2024-01-15T09:00:00.000Z',
        path: '/api/v1/projects/invalid-id',
        method: 'GET',
        message: 'Project with id "invalid-id" not found',
      },
    },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get task stats for a project',
    description: 'Returns a breakdown of task counts grouped by status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Project task statistics',
    schema: {
      example: {
        success: true,
        data: {
          projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          total: 8,
          breakdown: [
            { status: 'todo', count: '3' },
            { status: 'in_progress', count: '2' },
            { status: 'in_review', count: '1' },
            { status: 'done', count: '2' },
          ],
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getStats(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a project',
    description: 'Partially updates a project. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOkResponse({ description: 'Project updated successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({ description: 'Project name already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a project',
    description:
      '⚠️ Permanently deletes the project and **all its tasks** (cascade delete).',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Project deleted successfully',
    schema: {
      example: {
        success: true,
        data: { message: 'Project "Website Redesign" deleted successfully' },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }
}
