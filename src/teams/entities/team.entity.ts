import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity({ name: 'teams' })
export class Team {
  @Column({ primary: true, type: 'uuid' })
  id: string;
  @Column()
  name: string;
  @OneToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  cordinator: User;
  @OneToMany(() => User, (user) => user.team, { nullable: true })
  users: User[];
}
