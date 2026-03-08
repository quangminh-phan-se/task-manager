import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class QueryProjectDto {
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsString()
  @IsOptional()
  search?: string;
}
