import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import env from 'src/config/env';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Team } from 'src/teams/entities/team.entity';
import { ConfigModule } from '@nestjs/config';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { hashSync } from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let Users: Repository<User>;
  let user1: User, admin1: User;

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
          database: env().postgres.dbTest,
          username: env().postgres.username,
          password: env().postgres.password,
          host: env().postgres.host,
          port: env().postgres.port,
          synchronize: true,
          logging: false,
          entities: [User, Team, Task, Assignment],
        }),
        TypeOrmModule.forFeature([User, Team]),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    Users = module.get<Repository<User>>(getRepositoryToken(User));
    // fill database
    const password = hashSync(
      'password' + env().bcrypt.paper,
      env().bcrypt.salt,
    );
    user1 = await Users.save({
      id: uuid(),
      email: 'user1@user.com',
      name: 'user1',
      password,
    });
    admin1 = await Users.save({
      id: uuid(),
      email: 'admin1@user.com',
      name: 'admin1',
      password,
    });
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const res = await controller.findAll();
    expect(res).toContainEqual(expect.objectContaining(user1));
    expect(res).toContainEqual(expect.objectContaining(admin1));
  });

  it('should return admin1', async () => {
    const res = await controller.findOne(admin1.id);
    expect(res).toEqual(expect.objectContaining(admin1));
  });

  it('should throw bad request', async () => {
    await expect(async () => {
      await controller.findOne(uuid());
    }).rejects.toThrow(BadRequestException);
  });

  it('should update user name', async () => {
    const res = (await controller.update(user1.id, {
      name: 'new user1',
    })) as unknown as User;
    expect(res.name).toBe('new user1');
  });

  it('should throw bad request cause repeated names', async () => {
    await expect(async () => {
      (await controller.update(user1.id, {
        name: 'admin1',
      })) as unknown as User;
    }).rejects.toThrow(BadRequestException);
  });

  it('should return removed user', async () => {
    await controller.remove(user1.id);
    expect(await Users.findOne({ where: { id: user1.id } })).toBeFalsy();
  });

  it('should throw bad request cause not exists id', async () => {
    await expect(async () => await controller.remove(uuid())).rejects.toThrow(
      BadRequestException,
    );
  });
  afterAll(async () => {
    await Users.delete({});
  });
});
