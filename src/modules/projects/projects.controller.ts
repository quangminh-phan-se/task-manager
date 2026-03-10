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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth('access-token')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiCreatedResponse({ description: 'Project created successfully' })
  @ApiConflictResponse({ description: 'Project name already exists' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects (paginated)',
    description: `
Supports **pagination**, **filtering**, and **sorting**.

**Example queries:**
- \`?page=1&limit=10\` — first 10 projects
- \`?status=active&sortBy=name&sortOrder=ASC\` — active projects sorted by name
- \`?search=website&page=2&limit=5\` — search with pagination
    `.trim(),
  })
  @ApiOkResponse({
    description: 'Paginated list of projects',
    schema: {
      example: {
        success: true,
        data: {
          data: [
            {
              id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              name: 'Website Redesign',
              status: 'active',
              taskCount: 5,
              createdAt: '2024-01-15T09:00:00.000Z',
            },
          ],
          meta: {
            page: 1,
            limit: 10,
            totalItems: 42,
            totalPages: 5,
            hasPreviousPage: false,
            hasNextPage: true,
          },
        },
        timestamp: '2024-01-15T09:00:00.000Z',
      },
    },
  })
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID (with tasks)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Project with tasks' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get task stats for a project' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Task breakdown by status' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOkResponse({ description: 'Project updated' })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a project — ADMIN only (cascade deletes tasks)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Project deleted' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }
}
