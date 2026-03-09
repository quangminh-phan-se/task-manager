import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class QueryProjectDto {
  @ApiPropertyOptional({
    description: 'Filter projects by status',
    enum: ProjectStatus,
    enumName: 'ProjectStatus',
    example: ProjectStatus.ACTIVE,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Search projects by name (case-insensitive)',
    example: 'website',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
