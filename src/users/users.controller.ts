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
  UseFilters,
  BadRequestException,
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
import { DbExceptionFilter } from 'src/shared/filters/http-filters/db-exception.filter';

@Controller('users')
@UseGuards(IsAuthenticatedGuard)
@UseFilters(DbExceptionFilter)
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
  async update(
    @Param('id', new IdParamPipe()) id: string,
    @Body(new UpdateUserPipe()) updateUserDto: AdminUpdateUserDto,
  ) {
    if (!(await this.usersService.update(id, updateUserDto)))
      throw new BadRequestException('cannot update');
  }

  @Put('me')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!(await this.usersService.update(request['user'].id, updateUserDto)))
      throw new BadRequestException('cannot update');
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async remove(@Param('id', new IdParamPipe()) id: string) {
    if (!(await this.usersService.remove(id)))
      throw new BadRequestException('user not found');
  }

  @Put('me/password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updatePassword(
    @Req() request: Request,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return await this.usersService.updatePassword(
      request['user'].id,
      updateUserPasswordDto,
    );
  }
}
