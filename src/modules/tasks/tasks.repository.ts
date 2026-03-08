import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(private readonly dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async findAllWithProject(): Promise<Task[]> {
    return this.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .orderBy('task.createdAt', 'DESC')
      .getMany();
  }

  async findOneWithProject(id: string): Promise<Task | null> {
    return this.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.id = :id', { id })
      .getOne();
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.find({
      where: { status },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.find({
      where: { priority },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWithFilters(filters: {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  }): Promise<Task[]> {
    const query = this.createQueryBuilder('task').leftJoinAndSelect(
      'task.project',
      'project',
    );

    if (filters.projectId) {
      query.andWhere('task.project_id = :projectId', {
        projectId: filters.projectId,
      });
    }

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.search) {
      query.andWhere('LOWER(task.title) LIKE LOWER(:search)', {
        search: `%${filters.search}%`,
      });
    }

    return query.orderBy('task.createdAt', 'DESC').getMany();
  }

  async countByProjectAndStatus(
    projectId: string,
  ): Promise<{ status: string; count: string }[]> {
    return this.createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.project_id = :projectId', { projectId })
      .groupBy('task.status')
      .getRawMany();
  }
}
