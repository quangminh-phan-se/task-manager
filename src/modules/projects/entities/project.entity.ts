import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
}

@Entity('projects')
export class Project {
  @ApiProperty({
    description: 'Unique identifier (UUID v4)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Project name',
    example: 'Website Redesign',
    minLength: 2,
    maxLength: 100,
  })
  @Column({ length: 100 })
  name: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'Full redesign of the company website with new branding',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Current project status',
    enum: ProjectStatus,
    enumName: 'ProjectStatus',
    example: ProjectStatus.ACTIVE,
    default: ProjectStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Tasks belonging to this project',
    type: () => Task,
    isArray: true,
  })
  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks: Task[];

  @ApiProperty({
    description: 'Date the project was created',
    example: '2024-01-15T09:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date the project was last updated',
    example: '2024-01-20T14:30:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
