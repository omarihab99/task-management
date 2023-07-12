import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import env from 'src/config/env';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Team } from 'src/teams/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Feedback } from './entities/feedback.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { hashSync } from 'bcrypt';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let Tasks: Repository<Task>;
  let Assignments: Repository<Assignment>;
  let Users: Repository<User>;
  let Reviews: Repository<Review>;
  let Feedbacks: Repository<Feedback>;
  // db
  let user1: User,
    user2: User,
    user3: User,
    coach1: User,
    coach2: User,
    task1: Task,
    assignment1: Assignment,
    review1: Review,
    review2: Review,
    feedback1: Feedback;

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
      providers: [FeedbackService],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    Tasks = module.get<Repository<Task>>(getRepositoryToken(Task));
    Users = module.get<Repository<User>>(getRepositoryToken(User));
    Assignments = module.get<Repository<Assignment>>(
      getRepositoryToken(Assignment),
    );
    Reviews = module.get<Repository<Review>>(getRepositoryToken(Review));
    Feedbacks = module.get<Repository<Feedback>>(getRepositoryToken(Feedback));
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
    const coach1Id = uuid();
    const coach2Id = uuid();

    [user1, user2, user3, coach1, coach2] = await Users.save([
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
      {
        id: coach1Id,
        name: 'coach1',
        email: 'coach1@user.com',
        role: 'coach',
        password,
        token: new JwtService().sign(
          { userId: coach1Id },
          { secret: env().jwt.secret, expiresIn: '1h' },
        ),
      },
      {
        id: coach2Id,
        name: 'coach2',
        email: 'coach2@user.com',
        role: 'coach',
        password,
        token: new JwtService().sign(
          { userId: coach2Id },
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
    review1 = await Reviews.save({
      id: uuid(),
      DS: 5,
      QDS: 5,
      assignment: assignment1,
      user: user2,
    });
    review2 = await Reviews.save({
      id: uuid(),
      DS: 5,
      QDS: 5,
      assignment: assignment1,
      user: user3,
    });
  });

  describe('create', () => {
    it('should create review', async () => {
      feedback1 = await service.create(coach1.id, {
        DS: 5,
        QDS: 5,
        budget: 5,
        satisfaction: 5,
        assignment: assignment1.id,
        comment: 'excellent',
      });
      expect(feedback1.comment).toEqual('excellent');
      expect(Object.keys(feedback1)).toEqual([
        'id',
        'DS',
        'QDS',
        'budget',
        'satisfaction',
        'comment',
        'createdAt',
        'updatedAt',
        'user',
        'assignment',
      ]);
      expect(Object.keys(feedback1.assignment)).toEqual(['id', 'task']);
    });
  });

  describe('find', () => {
    it('should find all feedbacks', async () => {
      const feedbacks = await service.findAll();
      expect(feedbacks.length).toBe(1);
      expect(feedbacks[0].id).toBe(feedback1.id);
    });

    it('should find one feedback', async () => {
      const feedback = await service.findOne(feedback1.id);
      expect(feedback.id).toBe(feedback1.id);
    });
  });

  describe('update', () => {
    it('should throw if another coach update feedback', async () => {
      await expect(
        service.update(user2.id, {
          id: feedback1.id,
          comment: 'new comment',
        }),
      ).rejects.toThrow();
    });

    it('should update feedback', async () => {
      const feedback = await service.update(coach1.id, {
        id: feedback1.id,
        comment: 'new comment',
      });
      expect(feedback.comment).toBe('new comment');
    });
  });

  describe('remove', () => {
    it('should throw if remove inexists feedback', async () => {
      await expect(service.remove(uuid())).rejects.toThrow();
    });
    it('should remove feedback', async () => {
      expect(await service.remove(feedback1.id)).toBe(feedback1.id);
    });
  });

  afterAll(async () => {
    await Users.delete({});
    await Tasks.delete({});
    await Assignments.delete({});
    await Reviews.delete({});
    await Feedbacks.delete({});
  });
});
