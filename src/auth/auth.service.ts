import { BadRequestException, Injectable } from '@nestjs/common';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcrypt';
import env from 'src/config/env';
import {
  ForgetPasswordDto,
  ResetUserPasswordDto,
} from './dto/forget-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private Users: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signin(signinDto: SigninDto) {
    const user = await this.Users.findOne({
      where: { email: signinDto.email },
    });
    if (
      !user ||
      !compareSync(signinDto.password + env().bcrypt.paper, user.password)
    )
      throw new BadRequestException('incorrect email or password');
    const token = this.jwtService.sign({ userId: user.id });
    return this.Users.save({ ...user, token });
  }

  async signup(signupDto: SignupDto) {
    const user = await this.Users.findOne({
      where: [{ name: signupDto.name }, { email: signupDto.email }],
    });
    if (user) throw new BadRequestException('user already exists');
    return await this.Users.save(
      this.Users.create({ id: uuid(), ...signupDto }),
    );
  }

  async forgetPassword(data: ForgetPasswordDto) {
    const user = await this.Users.findOne({ where: { email: data.email } });
    if (!user) throw new BadRequestException('user not found');
    const expirationCode = new Date(Date.now() + 2 * 60 * 1000);
    return this.Users.save({
      ...user,
      token: null,
      verificationCode: this.generateRandomVerificationCode(),
      expirationCode,
    });
  }

  private generateRandomVerificationCode() {
    const res = [];
    for (let i = 0; i < 10; i++) {
      res.push((Math.random() + 1).toString(36).substring(2));
    }
    return res.join('');
  }

  async resetForgetedPassword(data: ResetUserPasswordDto) {
    const user = await this.Users.findOne({
      where: { verificationCode: data.verificationCode },
    });
    if (!user) throw new BadRequestException(`expired verificationCode`);
    if (Date.now() > new Date(user.expirationCode).getTime())
      throw new BadRequestException(`expired verificationCode`);
    const hashedPassword = hashSync(
      data.newPassword + env().bcrypt.paper,
      env().bcrypt.salt,
    );
    return this.Users.save({
      ...user,
      password: hashedPassword,
      verificationCode: null,
      expirationCode: null,
      token: null,
    });
  }
}
