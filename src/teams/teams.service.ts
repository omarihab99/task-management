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
  async create(createTeamDto: CreateTeamDto) {
    const cordinator = await this.verifyCreateTeamDto(createTeamDto);
    return this.Teams.save({
      id: uuid(),
      name: createTeamDto.name,
      cordinator,
    });
  }

  async findAll() {
    return await this.Teams.find({
      relations: ['cordinator', 'users'],
    });
  }

  async findOne(id: string) {
    const team = await this.Teams.findOne({
      where: { id },
      relations: ['cordinator', 'users'],
    });
    if (!team) throw new BadRequestException('team not found');
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    const cordinator = await this.verifyupdateTeamDto(id, updateTeamDto);
    const newTeam = { id, name: updateTeamDto.name };
    if (cordinator) newTeam['cordinator'] = cordinator;
    return this.Teams.save(newTeam);
  }

  async remove(id: string) {
    const team = await this.Teams.findOne({ where: { id } });
    if (!team) throw new BadRequestException('team not found');
    this.Teams.remove(team);
  }

  private async verifyCreateTeamDto(createTeamDto: CreateTeamDto) {
    if (await this.Teams.findOne({ where: { name: createTeamDto.name } }))
      throw new BadRequestException('team is already exists');
    const cordinator = createTeamDto.cordinator
      ? await this.Users.findOne({ where: { id: createTeamDto.cordinator } })
      : null;
    if (createTeamDto.cordinator && !cordinator)
      throw new BadRequestException('cordinator user not found');
    if (
      cordinator &&
      (await this.Teams.findOne({
        where: { cordinator: { id: cordinator.id } },
      }))
    )
      throw new BadRequestException('user already cordinator at a team');

    return cordinator;
  }
  private async verifyupdateTeamDto(id: string, updateTeamDto: UpdateTeamDto) {
    if (!(await this.Teams.findOne({ where: { id } })))
      throw new BadRequestException('team not found');
    if (
      updateTeamDto.name &&
      (await this.Teams.findOne({
        where: { name: updateTeamDto.name, id: Not(id) },
      }))
    )
      throw new BadRequestException('team is already exists');
    const cordinator = updateTeamDto.cordinator
      ? await this.Users.findOne({ where: { id: updateTeamDto.cordinator } })
      : null;
    if (updateTeamDto.cordinator && !cordinator)
      throw new BadRequestException('cordinator user not found');
    if (
      cordinator &&
      (await this.Teams.findOne({
        where: { cordinator: { id: cordinator.id }, id: Not(id) },
      }))
    )
      throw new BadRequestException('user already cordinator at a team');

    return cordinator;
  }
}
