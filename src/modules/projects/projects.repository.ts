import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { SortOrder } from '../../common/dto/pagination.dto';
import { QueryProjectDto, ProjectSortBy } from './dto/query-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsRepository extends Repository<Project> {
  constructor(private readonly dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  async findWithPagination(
    query: QueryProjectDto,
  ): Promise<PaginatedResponse<Project>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = ProjectSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const qb = this.createQueryBuilder('project')

      .loadRelationCountAndMap('project.taskCount', 'project.tasks');

    if (search) {
      qb.andWhere('LOWER(project.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('project.status = :status', { status });
    }

    const sortColumnMap: Record<ProjectSortBy, string> = {
      [ProjectSortBy.NAME]: 'project.name',
      [ProjectSortBy.STATUS]: 'project.status',
      [ProjectSortBy.CREATED_AT]: 'project.createdAt',
      [ProjectSortBy.UPDATED_AT]: 'project.updatedAt',
    };
    qb.orderBy(sortColumnMap[sortBy], sortOrder);

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, totalItems] = await qb.getManyAndCount();

    return new PaginatedResponse(data, totalItems, page, limit);
  }

  async findOneWithTasks(id: string): Promise<Project | null> {
    return this.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('project.id = :id', { id })
      .orderBy('task.createdAt', 'DESC')
      .getOne();
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const qb = this.createQueryBuilder('project').where(
      'LOWER(project.name) = LOWER(:name)',
      { name },
    );

    if (excludeId) {
      qb.andWhere('project.id != :excludeId', { excludeId });
    }

    return (await qb.getCount()) > 0;
  }
}
