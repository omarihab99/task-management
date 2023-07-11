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

@Entity({ name: 'reviews' })
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
  @ManyToOne(() => User, (user) => user.reviews)
  @Index(['user', 'assignment'], { unique: true })
  user: User;
  @ManyToOne(() => Assignment, (assignment) => assignment.reviews)
  @Index(['user', 'assignment'], { unique: true })
  assignment: Assignment;
}
