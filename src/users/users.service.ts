import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
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
    return await this.Users.find({
      relations: ['team'],
      select: ['id', 'email', 'role', 'name'],
    });
  }

  async findOne(id: string) {
    const user = await this.Users.findOne({
      where: { id },
      relations: ['team'],
      select: ['id', 'email', 'role', 'name'],
    });
    if (!user) throw new BadRequestException('user not found');
    return user;
  }

  async update(
    id: string,
    updateUserDto: AdminUpdateUserDto | UpdateUserDto,
  ): Promise<boolean> {
    if ((updateUserDto as AdminUpdateUserDto).team) {
      const team = await this.Teams.findOne({
        where: { id: (updateUserDto as AdminUpdateUserDto).team },
      });
      updateUserDto['team'] = team;
    }
    const res = await this.Users.update(id, {
      id,
      ...(updateUserDto as [unknown]),
    });
    return res.affected > 0;
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.Users.delete({ id });
    return res.affected > 0;
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

    const res = await this.Users.update(id, {
      password: hashedPassword,
      token: null,
    });
    return res.affected > 0;
  }
}
