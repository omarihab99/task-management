import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { v4 as uuid } from 'uuid';
import { hashSync } from 'bcrypt';
import env from 'src/config/env';

describe('TeamsController', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let Teams: Repository<Team>, Users: Repository<User>;
  let team1: Team, team2: Team;
  let adminUser: User, user1: User, user2: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    Teams = app.get<Repository<Team>>(getRepositoryToken(Team));
    Users = app.get<Repository<User>>(getRepositoryToken(User));
    request = supertest(app.getHttpServer());
  });

  //fill DB
  beforeAll(async () => {
    adminUser = await Users.save({
      id: uuid(),
      email: 'admin@user.com',
      name: 'admin',
      role: 'admin',
      password: hashSync('password' + env().bcrypt.paper, env().bcrypt.salt),
    });

    user1 = await Users.save({
      id: uuid(),
      email: 'user1@user.com',
      name: 'user1',
      password: hashSync('password' + env().bcrypt.paper, env().bcrypt.salt),
    });
    user2 = await Users.save({
      id: uuid(),
      email: 'user2@user.com',
      name: 'user2',
      password: hashSync('password' + env().bcrypt.paper, env().bcrypt.salt),
    });

    team1 = await Teams.save({
      id: uuid(),
      name: 'team1',
      cordinator: user1,
      users: [user1],
    });
    team2 = await Teams.save({
      id: uuid(),
      name: 'team2',
    });

    const adminLogin = await request
      .post('/auth/signin')
      .send({ email: 'admin@user.com', password: 'password' });
    adminUser.token = adminLogin.body.token;
  });

  it('should return all teams', () => {
    return request
      .get('/teams')
      .set({ Authorization: `Bearer ${adminUser.token}` })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toContainEqual(
          expect.objectContaining({ name: 'team1' }),
        );
        expect(res.body).toContainEqual(
          expect.objectContaining({ name: 'team2' }),
        );
        expect(Object.keys(res.body[0])).toEqual([
          'id',
          'name',
          'cordinator',
          'users',
        ]);
        expect(Object.keys(res.body[0].cordinator)).toEqual([
          'id',
          'email',
          'name',
        ]);
        expect(Object.keys(res.body[0].users[0])).toEqual([
          'id',
          'email',
          'name',
        ]);
      });
  });
  it('should return one team', () => {
    return request
      .get(`/teams/${team1.id}`)
      .set({ Authorization: `Bearer ${adminUser.token}` })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toEqual(expect.objectContaining({ name: 'team1' }));
        expect(Object.keys(res.body)).toEqual([
          'id',
          'name',
          'cordinator',
          'users',
        ]);
        expect(Object.keys(res.body.cordinator)).toEqual([
          'id',
          'email',
          'name',
        ]);
        expect(Object.keys(res.body.users[0])).toEqual(['id', 'email', 'name']);
      });
  });
  it('should create a team', () => {
    return request
      .post('/teams')
      .set({ Authorization: `Bearer ${adminUser.token}` })
      .send({ name: 'team3', cordinator: user2.id })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toEqual({});
      });
  });
  it('should delete a team', () => {
    return request
      .delete(`/teams/${team2.id}`)
      .set({ Authorization: `Bearer ${adminUser.token}` })
      .expect(HttpStatus.NO_CONTENT)
      .expect((res) => {
        expect(res.body).toEqual({});
      });
  });

  afterAll(async () => {
    await Users.delete({});
    await Teams.delete({});
    await app.close();
  });
});
