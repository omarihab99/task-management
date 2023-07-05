import {
  Controller,
  Get,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AdminUpdateUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './dto/update-user.dto';
import { IdParamPipe } from './pipes/id-param.pipe';
import { IsAuthenticatedGuard } from 'src/auth/guards/is-authenticated.guard';
import { Roles } from 'src/shared/decorators/role.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Request } from 'express';
import { UpdateUserPipe } from './pipes/update-user.pipe';

@Controller('users')
@UseGuards(IsAuthenticatedGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new IdParamPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  // admin update user
  @Patch(':id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  update(
    @Param('id', new IdParamPipe()) id: string,
    @Body(new UpdateUserPipe()) updateUserDto: AdminUpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('me')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateProfile(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(request['user'].id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  @UseGuards(RoleGuard)
  remove(@Param('id', new IdParamPipe()) id: string) {
    return this.usersService.remove(id);
  }

  @Put('me/password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updatePassword(
    @Req() request: Request,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.usersService.updatePassword(
      request['user'].id,
      updateUserPasswordDto,
    );
  }
}
