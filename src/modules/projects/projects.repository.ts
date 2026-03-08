import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectsRepository extends Repository<Project> {
  constructor(private readonly dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  async findAllWithTaskCount(): Promise<Project[]> {
    return this.createQueryBuilder('project')
      .loadRelationCountAndMap('project.taskCount', 'project.tasks')
      .orderBy('project.createdAt', 'DESC')
      .getMany();
  }

  async findOneWithTasks(id: string): Promise<Project | null> {
    return this.createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('project.id = :id', { id })
      .orderBy('task.createdAt', 'DESC')
      .getOne();
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async searchByName(search: string): Promise<Project[]> {
    return this.createQueryBuilder('project')
      .where('LOWER(project.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      })
      .orderBy('project.createdAt', 'DESC')
      .getMany();
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('project').where(
      'LOWER(project.name) = LOWER(:name)',
      { name },
    );

    if (excludeId) {
      query.andWhere('project.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
