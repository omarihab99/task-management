import {
  Controller,
  Post,
  Body,
  UsePipes,
  HttpCode,
  ValidationPipe,
  UseGuards,
  Get,
  Put,
  UseFilters,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { SignupPipe } from './pipes/signup.pipe';
import { Roles } from '../shared/decorators/role.decorator';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { RoleGuard } from './guards/role.guard';
import {
  ForgetPasswordDto,
  ResetUserPasswordDto,
} from './dto/forget-password.dto';
import { DbExceptionFilter } from 'src/shared/filters/http-filters/db-exception.filter';

@Controller('auth')
@UseFilters(DbExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('signup')
  @Roles('admin')
  @UseGuards(IsAuthenticatedGuard, RoleGuard)
  @HttpCode(201)
  @UsePipes(SignupPipe)
  async signup(@Body() signupDto: SignupDto) {
    if (!(await this.authService.signup(signupDto)))
      throw new BadRequestException('cannot create user');
  }

  @Get('forget-password')
  @UsePipes(new ValidationPipe())
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Put('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetForgetedPassword(
    @Body() resetUserPasswordDto: ResetUserPasswordDto,
  ) {
    if (!(await this.authService.resetForgetedPassword(resetUserPasswordDto)))
      throw new BadRequestException('cannot reset password');
  }
}
