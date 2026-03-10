import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProjectStatus } from '../entities/project.entity';

export enum ProjectSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
}

export class QueryProjectDto extends IntersectionType(PaginationDto) {
  @ApiPropertyOptional({
    description: 'Filter by project status',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Search by project name (case-insensitive)',
    example: 'website',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ProjectSortBy,
    default: ProjectSortBy.CREATED_AT,
  })
  @IsEnum(ProjectSortBy)
  @IsOptional()
  sortBy?: ProjectSortBy = ProjectSortBy.CREATED_AT;
}
