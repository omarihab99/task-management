import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Feedback } from 'src/feedback/entities/feedback.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Team } from 'src/teams/entities/team.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @Column({ primary: true, type: 'uuid' })
  id: string;
  @Column({ unique: true })
  email: string;
  @Column({ nullable: true })
  password: string;
  @Column({ default: 'trainee' })
  role: 'admin' | 'coach' | 'trainee';
  @Column({ unique: true })
  name: string;
  @Column({ nullable: true })
  token: string;
  @Column({ nullable: true })
  verificationCode: string;
  @Column({ nullable: true, type: 'timestamptz' })
  expirationCode: Date;
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
  @ManyToOne(() => Team, (team) => team.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  team: Team;
  @OneToMany(() => Assignment, (assignment) => assignment.user)
  assignments: Assignment[];
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];
}
