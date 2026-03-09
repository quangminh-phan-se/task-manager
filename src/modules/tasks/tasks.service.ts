import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsRepository } from '../projects/projects.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './entities/task.entity';
import { TasksRepository } from './tasks.repository';

const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [
    TaskStatus.IN_REVIEW,
    TaskStatus.TODO,
    TaskStatus.CANCELLED,
  ],
  [TaskStatus.IN_REVIEW]: [
    TaskStatus.DONE,
    TaskStatus.IN_PROGRESS,
    TaskStatus.CANCELLED,
  ],
  [TaskStatus.DONE]: [],
  [TaskStatus.CANCELLED]: [],
};

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(dto: CreateTaskDto) {
    const project = await this.projectsRepository.findOne({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException(
        `Project with id "${dto.projectId}" not found`,
      );
    }

    const task = this.tasksRepository.create(dto);
    return this.tasksRepository.save(task);
  }

  async findAll(query: QueryTaskDto) {
    return this.tasksRepository.findWithFilters({
      projectId: query.projectId,
      status: query.status,
      priority: query.priority,
      search: query.search,
    });
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOneWithProject(id);

    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id);

    if (dto.status && dto.status !== task.status) {
      const allowedTransitions = STATUS_TRANSITIONS[task.status];
      if (!allowedTransitions.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition task from "${task.status}" to "${dto.status}". ` +
            `Allowed transitions: ${allowedTransitions.length ? allowedTransitions.join(', ') : 'none'}`,
        );
      }
    }

    await this.tasksRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
    return { message: `Task "${task.title}" deleted successfully` };
  }

  async findByProject(projectId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    return this.tasksRepository.findByProjectId(projectId);
  }

  async updateStatus(id: string, status: TaskStatus) {
    return this.update(id, { status });
  }
}
