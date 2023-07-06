import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsGateway } from './assignments.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Assignment } from './entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Assignment])],
  providers: [AssignmentsGateway, AssignmentsService],
})
export class AssignmentsModule {}
