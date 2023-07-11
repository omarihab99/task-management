import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Team } from 'src/teams/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';
import { AssignmentsService } from './assignments.service';
import env from 'src/config/env';
import { v4 as uuid } from 'uuid';
import { hashSync } from 'bcrypt';

describe('AssignmentsServices', () => {
  let service: AssignmentsService;
  let Tasks: Repository<Task>;
  let Assignments: Repository<Assignment>;
  let Users: Repository<User>;
  // db
  let user1: User, user2: User, task1: Task, assignment1: Assignment;

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
        TypeOrmModule.forFeature([User, Team, Task, Assignment]),
      ],
      providers: [AssignmentsService],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    Tasks = module.get<Repository<Task>>(getRepositoryToken(Task));
    Users = module.get<Repository<User>>(getRepositoryToken(User));
    Assignments = module.get<Repository<Assignment>>(
      getRepositoryToken(Assignment),
    );
  });
  // fill db
  beforeAll(async () => {
    const user1Id = uuid();
    user1 = await Users.save({
      id: user1Id,
      email: 'user1@user.com',
      name: 'user1',
      password: hashSync('password' + env().bcrypt.paper, env().bcrypt.salt),
      role: 'trainee',
      token: new JwtService().sign(
        { userId: user1Id },
        { secret: env().jwt.secret, expiresIn: '1h' },
      ),
    });

    const user2Id = uuid();
    user2 = await Users.save({
      id: user2Id,
      email: 'user2@user.com',
      name: 'user2',
      password: hashSync('password' + env().bcrypt.paper, env().bcrypt.salt),
      role: 'trainee',
      token: new JwtService().sign(
        { userId: user2Id },
        { secret: env().jwt.secret, expiresIn: '1h' },
      ),
    });

    task1 = await Tasks.save({
      id: uuid(),
      title: 'task1',
      topic: 'topic1',
      sprint: 1,
      deadlineAt: new Date(Date.now()).toISOString(),
    });
  });

  describe('create a new assignment', () => {
    it('should create assignment', async () => {
      assignment1 = await service.create(user1.id, {
        task: task1.id,
        source: 'http://example.com',
      });
      expect(assignment1.status).toEqual('under review');
      expect(assignment1.source).toEqual('http://example.com');
      expect(assignment1.user.id).toBe(user1.id);
      expect(Object.keys(assignment1)).toEqual([
        'id',
        'source',
        'status',
        'comment',
        'createdAt',
        'updatedAt',
        'user',
        'task',
      ]);
      expect(Object.keys(assignment1.user)).toEqual(['id', 'name', 'team']);
      expect(Object.keys(assignment1.task)).toEqual([
        'id',
        'title',
        'topic',
        'sprint',
        'deadlineAt',
      ]);
    });

    it('should throw error if user create the same task', async () => {
      expect(() =>
        service.create(user1.id, {
          task: task1.id,
          source: 'http://example.com',
        }),
      ).rejects.toThrow();
    });
  });

  describe('find assignment', () => {
    it('should find all assignments', async () => {
      const assignments = await service.findAll();
      expect(assignments.length).toBe(1);
      expect(assignments[0]).toBeDefined();
      expect(Object.keys(assignments[0])).toEqual([
        'id',
        'source',
        'status',
        'comment',
        'createdAt',
        'updatedAt',
        'user',
        'task',
      ]);
      expect(Object.keys(assignments[0].user)).toEqual(['id', 'name', 'team']);
      expect(Object.keys(assignments[0].task)).toEqual([
        'id',
        'title',
        'topic',
        'sprint',
        'deadlineAt',
      ]);
    });
    it('should find one assignment', async () => {
      const assignment = await service.findOne(assignment1.id);
      expect(Object.keys(assignment)).toEqual([
        'id',
        'source',
        'status',
        'comment',
        'createdAt',
        'updatedAt',
        'user',
        'task',
      ]);
      expect(Object.keys(assignment.user)).toEqual(['id', 'name', 'team']);
      expect(Object.keys(assignment.task)).toEqual([
        'id',
        'title',
        'topic',
        'sprint',
        'deadlineAt',
      ]);
    });
  });

  describe('update assignment', () => {
    it('should update assignment comment', async () => {
      const assignment = await service.update(user1.id, {
        id: assignment1.id,
        comment: 'this is a comment',
      });
      expect(assignment.comment).toBe('this is a comment');
      expect(Object.keys(assignment)).toEqual([
        'id',
        'source',
        'status',
        'comment',
        'createdAt',
        'updatedAt',
        'user',
        'task',
      ]);
      expect(Object.keys(assignment.user)).toEqual(['id', 'name', 'team']);
      expect(Object.keys(assignment.task)).toEqual([
        'id',
        'title',
        'topic',
        'sprint',
        'deadlineAt',
      ]);
    });

    it('should throw if update assignment with another user', async () => {
      expect(() =>
        service.update(user2.id, {
          id: assignment1.id,
          comment: 'this is a comment',
        }),
      ).rejects.toThrow();
    });

    it('should throw if user ask for feedback before reviews', async () => {
      expect(
        service.updateStatus(user1.id, {
          id: assignment1.id,
          status: 'ask feedback',
        }),
      ).rejects.toThrow('must be reviewed by 2 users');
    });
    it('should throw if user update assignment to done', async () => {
      expect(
        service.updateStatus(user1.id, {
          id: assignment1.id,
          status: 'done',
        }),
      ).rejects.toThrow('Forbidden');
    });
  });

  describe('remove assignment', () => {
    it('should throw if user remove assignment for another', () => {
      expect(service.remove(user2.id, assignment1.id)).rejects.toThrow();
    });
    it('should remove assignment', async () => {
      const assignment = await service.remove(user1.id, assignment1.id);
      expect(assignment).toBeDefined();
    });
  });

  afterAll(async () => {
    await Users.delete({});
    await Tasks.delete({});
    await Assignments.delete({});
  });
});
