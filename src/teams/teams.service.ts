import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Not, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private Teams: Repository<Team>,
    @InjectRepository(User) private Users: Repository<User>,
  ) {}
  async create(data: CreateTeamDto) {
    if (data.cordinator) {
      const cordinator = await this.Users.findOne({
        where: { id: data.cordinator },
      });
      if (!cordinator) throw new BadRequestException('cordinator not found');
      data.cordinator = cordinator as any;
      data['users'] = [cordinator];
    }
    return await this.Teams.save({
      id: uuid(),
      ...(data as any),
    });
  }

  async findAll() {
    return await this.Teams.find({
      relations: ['cordinator', 'users'],
      select: {
        cordinator: { id: true, email: true, name: true },
        users: { id: true, email: true, name: true },
      },
    });
  }

  async findOne(id: string) {
    const team = await this.Teams.findOne({
      where: { id },
      relations: ['cordinator', 'users'],
      select: {
        cordinator: { id: true, email: true, name: true },
        users: { id: true, email: true, name: true },
      },
    });
    if (!team) throw new BadRequestException('team not found');
    return team;
  }

  async update(id: string, data: UpdateTeamDto) {
    // check if user exists in team users before be a team cordinator
    if (data.cordinator) {
      const team = await this.Teams.findOne({
        where: { id, users: { id: data.cordinator } },
        relations: ['users'],
        select: { users: { id: true } },
      });
      if (!team)
        throw new BadRequestException('cordinator do not belong to this team');
      data.cordinator = (await this.Users.findOneBy({
        id: data.cordinator,
      })) as any;
    }

    return (await this.Teams.update(id, data as any)).affected > 0;
  }

  async remove(id: string) {
    return (await this.Teams.delete({ id })).affected > 0;
  }

  async countTeams() {
    return { count: await this.Teams.count() };
  }
}
