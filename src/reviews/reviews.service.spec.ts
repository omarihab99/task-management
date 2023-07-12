import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import env from 'src/config/env';
import { Review } from './entities/review.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Team } from 'src/teams/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { hashSync } from 'bcrypt';

describe('ReviewsService', () => {
  let service: ReviewsService;
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
          entities: [User, Team, Task, Assignment, Review],
        }),
        TypeOrmModule.forFeature([User, Team, Task, Assignment, Review]),
      ],
      providers: [ReviewsService],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
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

  describe('create review', () => {
    it('should throw when create review on non exists assignment', () => {
      expect(
        service.create(user1.id, { assignment: uuid(), DS: 4, QDS: 4 }),
      ).rejects.toThrow();
    });

    it('should throw when user review him self', () => {
      expect(
        service.create(user1.id, { DS: 5, QDS: 5, assignment: assignment1.id }),
      ).rejects.toThrow();
    });

    it('should create review', async () => {
      review1 = (await service.create(user2.id, {
        assignment: assignment1.id,
        QDS: 5,
        DS: 5,
      })) as unknown as Review;
      expect(review1.DS).toBe(5);
      expect(Object.keys(review1)).toEqual([
        'id',
        'DS',
        'QDS',
        'comment',
        'user',
        'assignment',
      ]);
    });

    it('should throw if user review same assignment for the second', () => {
      expect(
        service.create(user2.id, { assignment: assignment1.id, QDS: 5, DS: 5 }),
      ).rejects.toThrow();
    });

    it('should user 3 review the same assignment', async () => {
      const review = (await service.create(user3.id, {
        assignment: assignment1.id,
        QDS: 1,
        DS: 1,
      })) as unknown as Review;
      expect(review.DS).toBe(1);
    });
  });

  describe('find', () => {
    it('should find one review', async () => {
      const review = await service.findOne(review1.id);
      expect(review.id).toEqual(review1.id);
      expect(Object.keys(review)).toEqual([
        'id',
        'DS',
        'QDS',
        'comment',
        'createdAt',
        'updatedAt',
        'user',
        'assignment',
      ]);
    });
  });

  describe('update', () => {
    it('should throw when update with another user', async () => {
      await expect(
        service.update(user3.id, { id: review1.id, QDS: 3 }),
      ).rejects.toThrow('not allowed');
    });
  });

  describe('remove', () => {
    it('should throw when remove another user review', async () => {
      await expect(service.remove(user3.id, review1.id)).rejects.toThrow();
    });
    it('should remove review', async () => {
      expect(await service.remove(user2.id, review1.id)).toBeDefined();
      await expect(service.findOne(review1.id)).rejects.toThrow(
        'review not found',
      );
    });
  });

  afterAll(async () => {
    await Users.delete({});
    await Tasks.delete({});
    await Assignments.delete({});
  });
});
