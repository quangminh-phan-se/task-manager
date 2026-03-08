/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(dto: CreateProjectDto) {
    // Check duplicate name
    const nameExists = await this.projectsRepository.existsByName(dto.name);
    if (nameExists) {
      throw new ConflictException(
        `Project with name "${dto.name}" already exists`,
      );
    }

    const project = this.projectsRepository.create(dto);
    return this.projectsRepository.save(project);
  }

  async findAll(query: QueryProjectDto) {
    // If search query, use search
    if (query.search) {
      return this.projectsRepository.searchByName(query.search);
    }

    // If status filter
    if (query.status) {
      return this.projectsRepository.findByStatus(query.status);
    }

    // Default: all with task count
    return this.projectsRepository.findAllWithTaskCount();
  }

  async findOne(id: string) {
    const project = await this.projectsRepository.findOneWithTasks(id);

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    // Guard: project must exist
    await this.findOne(id);

    // Check duplicate name (exclude current project)
    if (dto.name) {
      const nameExists = await this.projectsRepository.existsByName(
        dto.name,
        id,
      );
      if (nameExists) {
        throw new ConflictException(
          `Project with name "${dto.name}" already exists`,
        );
      }
    }

    await this.projectsRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.projectsRepository.remove(project);
    return { message: `Project "${project.name}" deleted successfully` };
  }

  async getStats(id: string) {
    // Guard: project must exist
    await this.findOne(id);

    const statusCounts = await this.projectsRepository.manager
      .getRepository('Task')
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.project_id = :id', { id })
      .groupBy('task.status')
      .getRawMany();

    const total = statusCounts.reduce(
      (sum: number, row: { count: string }) => sum + parseInt(row.count),
      0,
    );

    return {
      projectId: id,
      total,
      breakdown: statusCounts,
    };
  }
}
