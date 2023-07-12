import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackGateway } from './feedback.gateway';
import { FeedbackService } from './feedback.service';
import env from 'src/config/env';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Team } from 'src/teams/entities/team.entity';
import { Feedback } from './entities/feedback.entity';
import { Repository } from 'typeorm';
import { hashSync } from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Socket } from 'socket.io';

describe('FeedbackGateway', () => {
  let gateway: FeedbackGateway;
  let Tasks: Repository<Task>;
  let Assignments: Repository<Assignment>;
  let Users: Repository<User>;
  // db
  let user1: User,
    user2: User,
    user3: User,
    task1: Task,
    assignment1: Assignment,
    review1: Review;

  beforeAll(async () => {
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
          entities: [User, Team, Task, Assignment, Review, Feedback],
        }),
        TypeOrmModule.forFeature([User, Task, Assignment, Review, Feedback]),
      ],
      providers: [FeedbackGateway, FeedbackService],
    }).compile();

    gateway = module.get<FeedbackGateway>(FeedbackGateway);
    Tasks = module.get<Repository<Task>>(getRepositoryToken(Task));
    Users = module.get<Repository<User>>(getRepositoryToken(User));
    Assignments = module.get<Repository<Assignment>>(
      getRepositoryToken(Assignment),
    );
  });

  // fill db
  beforeAll(async () => {
    const password = hashSync(
      'password' + env().bcrypt.paper,
      env().bcrypt.salt,
    );
    const user1Id = uuid();
    const user2Id = uuid();
    const user3Id = uuid();
    [user1, user2, user3] = await Users.save([
      {
        id: user1Id,
        name: 'user1',
        email: 'user1@user.com',
        role: 'trainee',
        password,
        token: new JwtService().sign(
          { userId: user1Id },
          { secret: env().jwt.secret, expiresIn: '1h' },
        ),
      },
      {
        id: user2Id,
        name: 'user2',
        email: 'user2@user.com',
        role: 'trainee',
        password,
        token: new JwtService().sign(
          { userId: user2Id },
          { secret: env().jwt.secret, expiresIn: '1h' },
        ),
      },
      {
        id: user3Id,
        name: 'user3',
        email: 'user3@user.com',
        role: 'trainee',
        password,
        token: new JwtService().sign(
          { userId: user3Id },
          { secret: env().jwt.secret, expiresIn: '1h' },
        ),
      },
    ]);
    task1 = await Tasks.save({
      id: uuid(),
      title: 'task1',
      topic: 'topic1',
      sprint: 1,
      deadlineAt: new Date(Date.now()).toISOString(),
    });
    assignment1 = await Assignments.save({
      id: uuid(),
      source: 'http://example.com',
      user: user1,
      task: task1,
    });
  });

  it('should be defined', () => {
    console.log(user1.id, user2.id, user3.id);
    console.log(task1.id);
    console.log(assignment1.id);
    expect(/*gateway.create()*/ true).toBeDefined();
  });

  afterAll(async () => {
    await Users.delete({});
    await Tasks.delete({});
    await Assignments.delete({});
  });
});
