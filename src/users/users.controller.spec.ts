import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AppModule } from 'src/app.module';
import * as supertest from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';
import env from 'src/config/env';
// import { Request, Response } from 'express';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let Users: Repository<User>;
  let traineeUser: User, adminUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // controller = module.get<UsersController>(UsersController);
    Users = module.get<Repository<User>>(getRepositoryToken(User));
    // fill database
    const password = hashSync(
      'password' + env().bcrypt.paper,
      env().bcrypt.salt,
    );
    traineeUser = await Users.save({
      id: uuid(),
      email: 'user1@user.com',
      name: 'user1',
      password,
    });
    adminUser = await Users.save({
      id: uuid(),
      email: 'admin1@user.com',
      name: 'admin1',
      role: 'admin',
      password,
    });

    app = module.createNestApplication();
    await app.init();
    request = supertest(app.getHttpServer());
  });

  beforeAll(async () => {
    const res1: supertest.Response = await request
      .post('/auth/signin')
      .send({ email: 'user1@user.com', password: 'password' });
    // .then((res) => (traineeUserToken = res.body.token));
    traineeUser.token = res1.body.token;
    const res2: supertest.Response = await request
      .post('/auth/signin')
      .send({ email: 'admin1@user.com', password: 'password' });
    // .then((res) => (adminUserToken = res.body.token));
    adminUser.token = res2.body.token;
  });

  describe('find all users route', () => {
    it('should throw unAuthorized exception', () => {
      return request
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body).toMatchObject({ message: 'token not found' });
        });
    });

    it('should return all users', () => {
      return request
        .get('/users')
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toContainEqual(
            expect.objectContaining({ id: traineeUser.id }),
          );
          expect(res.body).toContainEqual(
            expect.objectContaining({ id: adminUser.id }),
          );
          expect(Object.keys(res.body[0])).toEqual([
            'id',
            'email',
            'role',
            'name',
            'team',
          ]);
        });
    });
  });

  describe('find one user route', () => {
    it('should return one users', () => {
      return request
        .get(`/users/${traineeUser.id}`)
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ id: traineeUser.id }),
          );
          expect(Object.keys(res.body)).toEqual([
            'id',
            'email',
            'role',
            'name',
            'team',
          ]);
        });
    });
    it('should throw error cause non exists user', () => {
      return request
        .get(`/users/${uuid()}`)
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ message: 'user not found' }),
          );
        });
    });
  });

  describe('update user', () => {
    it('should throw error if not admin', () => {
      return request
        .patch(`/users/${uuid()}`)
        .set({ Authorization: `Bearer ${traineeUser.token}` })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should admin updat name of user', async () => {
      await request
        .patch(`/users/${traineeUser.id}`)
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .send({ name: 'updated name user1' })
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body).toEqual({}));

      await request
        .get(`/users/${traineeUser.id}`)
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.name).toBe('updated name user1'));
    });

    it('should throw error cause repeated names', () => {
      return request
        .patch(`/users/${traineeUser.id}`)
        .send({ name: 'admin1' })
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .expect(HttpStatus.NOT_ACCEPTABLE)
        .expect((res) =>
          expect(res.body.message).toBe('name is not acceptable'),
        );
    });

    it('should user update his name', async () => {
      await request
        .put(`/users/me`)
        .set({ Authorization: `Bearer ${traineeUser.token}` })
        .send({ name: 'new name' })
        .expect(HttpStatus.OK)
        .expect({});

      await request
        .get(`/users/${traineeUser.id}`)
        .set({ Authorization: `Bearer ${traineeUser.token}` })
        .expect(HttpStatus.OK)
        .expect((res) => expect(res.body.name).toBe('new name'));
    });
    it('should user cannot update his data except name', () => {
      return request
        .put(`/users/me`)
        .set({ Authorization: `Bearer ${traineeUser.token}` })
        .send({ email: 'new@email.com', password: 'hhh', role: 'admin' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should update password', () => {
      return request
        .put(`/users/me/password`)
        .set({ Authorization: `Bearer ${traineeUser.token}` })
        .send({ oldPassword: 'password', newPassword: 'newPassword' })
        .expect(HttpStatus.OK)
        .expect({});
    });
  });

  describe('delete users', () => {
    // delete exists user
    it('should delete exists user', () => {
      return request
        .delete(`/users/${traineeUser.id}`)
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .expect(HttpStatus.NO_CONTENT)
        .expect({});
    });
    // delete inexists user
    it('should throw error delete unexists user', () => {
      return request
        .delete(`/users/${traineeUser.id}`)
        .set({ Authorization: `Bearer ${adminUser.token}` })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async () => {
    await Users.delete({});
    await app.close();
  });
});
