import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export enum TaskSortBy {
  TITLE = 'title',
  STATUS = 'status',
  PRIORITY = 'priority',
  DUE_DATE = 'dueDate',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class QueryTaskDto extends IntersectionType(PaginationDto) {
  @ApiPropertyOptional({
    description: 'Filter by task status',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter by task priority',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Filter by project UUID',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4')
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Search by task title (case-insensitive)',
    example: 'mockup',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks due on or after this date (YYYY-MM-DD)',
    example: '2024-01-01',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks due on or before this date (YYYY-MM-DD)',
    example: '2024-12-31',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: TaskSortBy,
    default: TaskSortBy.CREATED_AT,
  })
  @IsEnum(TaskSortBy)
  @IsOptional()
  sortBy?: TaskSortBy = TaskSortBy.CREATED_AT;
}
