import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tasks')
export class Task {
  @ApiProperty({
    description: 'Unique identifier (UUID v4)',
    example: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Design new landing page mockup',
    minLength: 2,
    maxLength: 200,
  })
  @Column({ length: 200 })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example:
      'Create Figma mockups for the new landing page based on brand guidelines',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Current task status',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.TODO,
    default: TaskStatus.TODO,
  })
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    enumName: 'TaskPriority',
    example: TaskPriority.MEDIUM,
    default: TaskPriority.MEDIUM,
  })
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @ApiPropertyOptional({
    description: 'Task due date (ISO 8601 date string)',
    example: '2024-02-28',
    nullable: true,
  })
  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @ApiProperty({
    description: 'UUID of the project this task belongs to',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @Column({ name: 'project_id' })
  projectId: string;

  @ApiPropertyOptional({
    description:
      'Project this task belongs to (populated when relations are loaded)',
    type: () => Project,
  })
  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ApiProperty({
    description: 'Date the task was created',
    example: '2024-01-15T09:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date the task was last updated',
    example: '2024-01-20T14:30:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
