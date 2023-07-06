import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import {
  AdminUpdateUserDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './dto/update-user.dto';
import { compareSync, hashSync } from 'bcrypt';
import env from 'src/config/env';
import { JwtService } from '@nestjs/jwt';
import { Team } from 'src/teams/entities/team.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private Users: Repository<User>,
    @InjectRepository(Team) private Teams: Repository<Team>,
    private jwtService: JwtService,
  ) {}
  async findAll() {
    return await this.Users.find({ relations: ['team'] });
  }

  async findOne(id: string) {
    const user = await this.Users.findOne({
      where: { id },
      relations: ['team'],
    });
    if (!user) throw new BadRequestException('user not found');
    return user;
  }

  async update(id: string, updateUserDto: AdminUpdateUserDto | UpdateUserDto) {
    const user = await this.Users.findOne({ where: { id } });
    if (!user) throw new BadRequestException('user not found');
    if (
      updateUserDto.name &&
      (await this.Users.findOne({
        where: { name: updateUserDto.name, id: Not(id) },
      }))
    )
      throw new BadRequestException('name already axists');
    if (
      (updateUserDto as AdminUpdateUserDto).email &&
      (await this.Users.findOne({
        where: {
          email: (updateUserDto as AdminUpdateUserDto).email,
          id: Not(id),
        },
      }))
    )
      throw new BadRequestException('email already axists');
    const team = await this.Teams.findOne({
      where: { id: (updateUserDto as AdminUpdateUserDto).team },
    });
    if ((updateUserDto as AdminUpdateUserDto).team && !team)
      throw new BadRequestException('team not found');
    if ((updateUserDto as AdminUpdateUserDto).team)
      updateUserDto['team'] = team;
    return this.Users.save({ ...user, ...(updateUserDto as [unknown]) });
  }

  async remove(id: string) {
    const user = await this.Users.findOne({ where: { id } });
    if (!user) throw new BadRequestException('user not found');
    await this.Users.remove(user);
  }

  async updatePassword(id: string, data: UpdateUserPasswordDto) {
    const user = await this.Users.findOne({ where: { id } });
    if (
      !user ||
      !compareSync(data.oldPassword + env().bcrypt.paper, user.password)
    )
      throw new BadRequestException('incorrect old password');
    const hashedPassword = hashSync(
      data.newPassword + env().bcrypt.paper,
      env().bcrypt.salt,
    );

    const token = this.jwtService.sign({ userId: user.id });

    return await this.Users.save({ ...user, password: hashedPassword, token });
  }
}
