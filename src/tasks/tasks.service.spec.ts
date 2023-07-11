import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import env from 'src/config/env';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Team } from 'src/teams/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Task } from './entities/task.entity';
import { TasksGateway } from './tasks.gateway';
import { Repository } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let Tasks: Repository<Task>;
  let task1: Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [env] }),
        JwtModule.register({
          global: true,
          secret: env().jwt.secret,
          signOptions: { expiresIn: '1d' },
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: env().postgres.db,
          username: env().postgres.username,
          password: env().postgres.password,
          host: env().postgres.host,
          port: env().postgres.port,
          synchronize: true,
          logging: false,
          entities: [User, Team, Task, Assignment, Review],
        }),
        TypeOrmModule.forFeature([User, Task]),
      ],
      providers: [TasksGateway, TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    Tasks = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('create a new task', async () => {
    expect(service).toBeDefined();
    task1 = await service.create({
      title: 'task-1',
      topic: 'topic-1',
      sprint: 1,
      deadlineAt: new Date(Date.now()).toISOString(),
    });

    expect(task1.title).toBe('task-1');
    expect(task1.topic).toBe('topic-1');
  });

  it('get all tasks', async () => {
    const tasks = await service.findAll();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('task-1');
  });
  it('get one tasks', async () => {
    const task = await service.findOne(task1.id);
    expect(task.title).toBe('task-1');
  });

  it('update task topic', async () => {
    const task = await service.update(task1.id, {
      id: task1.id,
      topic: 'new topic',
    });
    expect(task.topic).toBe('new topic');
  });

  it('remove task-1', async () => {
    const task = await service.remove(task1.id);
    expect(task).toBeInstanceOf(Task);
    expect(service.remove(task1.id)).rejects.toThrow('task not found');
  });

  afterAll(async () => {
    await Tasks.delete({});
  });
});
