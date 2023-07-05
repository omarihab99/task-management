import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksGateway } from './tasks.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task])],
  providers: [TasksGateway, TasksService],
})
export class TasksModule {}
