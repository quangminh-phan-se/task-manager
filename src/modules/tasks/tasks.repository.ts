import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { SortOrder } from '../../common/dto/pagination.dto';
import { QueryTaskDto, TaskSortBy } from './dto/query-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksRepository extends Repository<Task> {
  constructor(private readonly dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async findWithPagination(
    query: QueryTaskDto,
  ): Promise<PaginatedResponse<Task>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      projectId,
      dueDateFrom,
      dueDateTo,
      sortBy = TaskSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const qb = this.createQueryBuilder('task').leftJoinAndSelect(
      'task.project',
      'project',
    );

    // ── Filters ──────────────────────────────────────────────────────────────
    if (search) {
      qb.andWhere('LOWER(task.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    if (priority) {
      qb.andWhere('task.priority = :priority', { priority });
    }

    if (projectId) {
      qb.andWhere('task.project_id = :projectId', { projectId });
    }

    // ── Date range filter ─────────────────────────────────────────────────────
    if (dueDateFrom) {
      qb.andWhere('task.due_date >= :dueDateFrom', { dueDateFrom });
    }

    if (dueDateTo) {
      qb.andWhere('task.due_date <= :dueDateTo', { dueDateTo });
    }

    // ── Sorting ───────────────────────────────────────────────────────────────
    const sortColumnMap: Record<TaskSortBy, string> = {
      [TaskSortBy.TITLE]: 'task.title',
      [TaskSortBy.STATUS]: 'task.status',
      [TaskSortBy.PRIORITY]: 'task.priority',
      [TaskSortBy.DUE_DATE]: 'task.dueDate',
      [TaskSortBy.CREATED_AT]: 'task.createdAt',
      [TaskSortBy.UPDATED_AT]: 'task.updatedAt',
    };
    qb.orderBy(sortColumnMap[sortBy], sortOrder);

    // ── Pagination ────────────────────────────────────────────────────────────
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();

    return new PaginatedResponse(data, totalItems, page, limit);
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
