import { Assignment } from 'src/assignments/entities/assignment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tasks' })
export class Task {
  @Column({ primary: true, type: 'uuid' })
  id: string;
  @Column({ unique: true })
  title: string;
  @Column()
  topic: string;
  @Column()
  sprint: number;
  @Column({ type: 'timestamptz', nullable: false })
  deadlineAt: Date;
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  @OneToMany(() => Assignment, (assignment) => assignment.task)
  assignments: Assignment[];
}
