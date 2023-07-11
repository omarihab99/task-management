import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { Repository } from 'typeorm';
import * as supertest from 'supertest';
import { v4 as uuid } from 'uuid';
import { hashSync } from 'bcrypt';
import env from 'src/config/env';

describe('AuthController', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let Users: Repository<User>;
  let adminUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    Users = module.get<Repository<User>>(getRepositoryToken(User));
    app = module.createNestApplication();
    await app.init();
    request = supertest(app.getHttpServer());
  });

  // create super user
  beforeAll(async () => {
    adminUser = await Users.save({
      id: uuid(),
      email: 'admin@user.com',
      password: hashSync('password' + env().bcrypt.paper, env().bcrypt.salt),
      role: 'admin',
      name: 'admin',
    });
    const adminLogin = await request
      .post('/auth/signin')
      .send({ email: 'admin@user.com', password: 'password' });
    adminUser.token = adminLogin.body.token;
  });

  it('should signin', () => {
    return request
      .post('/auth/signin')
      .send({ email: 'admin@user.com', password: 'password' })
      .expect(HttpStatus.OK)
      .expect((res) => expect(Object.keys(res.body)).toEqual(['token']));
  });

  it('should reset forgetted password', async () => {
    const res1 = await request
      .get('/auth/forget-password')
      .send({ email: 'admin@user.com' });
    expect(res1.statusCode).toBe(HttpStatus.OK);
    expect(Object.keys(res1.body)).toEqual(['verificationCode']);

    const res2 = await request.put('/auth/reset-password').send({
      verificationCode: res1.body.verificationCode,
      newPassword: 'newPassword',
    });
    expect(res2.statusCode).toBe(HttpStatus.OK);
    expect(res2.body).toEqual({});

    const loginRes = await request
      .post('/auth/signin')
      .send({ email: 'admin@user.com', password: 'newPassword' });

    expect(loginRes.statusCode).toBe(HttpStatus.OK);
  });

  afterAll(async () => {
    await Users.delete({});
    await app.close();
  });
});
