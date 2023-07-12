import { Review } from 'src/reviews/entities/review.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'assignments' })
@Index('user_task_index', ['task', 'user'], { unique: true })
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
  // @Index(['task', 'user'], { unique: true })
  @ManyToOne(() => Task, (task) => task.assignments, { onDelete: 'CASCADE' })
  task: Task;
  // @Index(['task', 'user'], { unique: true })
  @ManyToOne(() => User, (user) => user.assignments, { onDelete: 'CASCADE' })
  user: User;
  @OneToMany(() => Review, (review) => review.assignment)
  reviews: Review[];
}
