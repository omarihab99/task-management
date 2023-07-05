import { IsString, Length } from 'class-validator';

export class AdminUpdateUserDto {
  email?: string;
  role?: 'trainee' | 'coach' | 'admin';
  name?: string;
  team?: string;
}

export class UpdateUserDto {
  @IsString()
  name: string;
}

export class UpdateUserPasswordDto {
  @IsString()
  @Length(6, 64)
  oldPassword: string;
  @IsString()
  @Length(6, 64)
  newPassword: string;
}
