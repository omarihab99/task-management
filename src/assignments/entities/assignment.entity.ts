import { Task } from 'src/tasks/entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'assignments' })
export class Assignment {
  @Column({ primary: true, type: 'uuid' })
  id: string;
  @Column()
  source: string;
  @Column({ default: 'under review' })
  status: 'done' | 'under review' | 'ask feedback';
  @Column({ nullable: true })
  comment: string;
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  @ManyToOne(() => Task, (task) => task.assignments)
  task: Task;
  @ManyToOne(() => User, (user) => user.assignments)
  user: User;
}
