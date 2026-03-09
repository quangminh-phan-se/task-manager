import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Design new landing page mockup',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Create Figma mockups based on brand guidelines v2.1',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Initial task status',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    default: TaskStatus.TODO,
    example: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus, {
    message: `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Task priority level',
    enum: TaskPriority,
    enumName: 'TaskPriority',
    default: TaskPriority.MEDIUM,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority, {
    message: `Priority must be one of: ${Object.values(TaskPriority).join(', ')}`,
  })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Task due date in ISO 8601 format (YYYY-MM-DD)',
    example: '2024-02-28',
    type: String,
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'dueDate must be a valid ISO date string (YYYY-MM-DD)' },
  )
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({
    description: 'UUID of the project this task belongs to',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'projectId must be a valid UUID' })
  @IsNotEmpty({ message: 'projectId is required' })
  projectId: string;
}
