import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, JwtService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    console.log(controller.signin({ email: 'dsa', password: 'asdad' }));
    expect(controller.signin).toBeDefined();
    // expect(
    //   controller.signin({ email: 'test1@test.com', password: 'password' }),
    // ).toThrowError(new BadRequestException('incorrect email or password'));
  });
});
