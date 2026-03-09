import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name — must be unique',
    example: 'Website Redesign',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Optional project description',
    example:
      'Full redesign of the company website with new branding guidelines',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Initial project status',
    enum: ProjectStatus,
    enumName: 'ProjectStatus',
    default: ProjectStatus.ACTIVE,
    example: ProjectStatus.ACTIVE,
  })
  @IsEnum(ProjectStatus, {
    message: `Status must be one of: ${Object.values(ProjectStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProjectStatus;
}
