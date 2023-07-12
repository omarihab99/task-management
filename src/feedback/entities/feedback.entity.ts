import { Assignment } from 'src/assignments/entities/assignment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'feedbacks' })
@Index('user_assignment_feedback_index', ['assignment', 'user'], {
  unique: true,
})
export class Feedback {
  @Column({ primary: true, type: 'uuid' })
  id: string;
  @Column()
  DS: number;
  @Column()
  QDS: number;
  @Column()
  budget: number;
  @Column()
  satisfaction: number;
  @Column()
  comment: string;
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  @ManyToOne(() => User, (user) => user.feedbacks, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;
  @ManyToOne(() => Assignment, (assignment) => assignment.feedbacks, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  assignment: Assignment;
}
