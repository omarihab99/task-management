import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reviews' })
@Index('user_assignment_index', ['assignment', 'user'], { unique: true })
export class Review {
  @Column({ primary: true, type: 'uuid' })
  id: string;
  @Column()
  DS: number;
  @Column()
  QDS: number;
  @Column({ nullable: true })
  comment: string;
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user: User;
  @ManyToOne(() => Assignment, (assignment) => assignment.reviews, {
    onDelete: 'CASCADE',
  })
  assignment: Assignment;
}
