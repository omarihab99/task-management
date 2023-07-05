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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { SignupPipe } from './pipes/signup.pipe';
import { Roles } from './decorators/role.decorator';
import { IsAuthenticatedGuard } from './guards/is-authenticated.guard';
import { RoleGuard } from './guards/role.guard';
import {
  ForgetPasswordDto,
  ResetUserPasswordDto,
} from './dto/forget-password.dto';

@Controller('auth')
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
  @HttpCode(200)
  @UsePipes(SignupPipe)
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Get('forget-password')
  @UsePipes(new ValidationPipe())
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Put('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  resetForgetedPassword(@Body() resetUserPasswordDto: ResetUserPasswordDto) {
    return this.authService.resetForgetedPassword(resetUserPasswordDto);
  }
}
