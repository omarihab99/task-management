import { IsEmail, IsString, Length } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetUserPasswordDto {
  @IsString()
  verificationCode: string;
  @IsString()
  @Length(6, 64)
  newPassword: string;
}
