import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  BadRequestException,
  UseFilters,
  HttpCode,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { IdParamPipe } from 'src/users/pipes/id-param.pipe';
import { IsAuthenticatedGuard } from 'src/auth/guards/is-authenticated.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/shared/decorators/role.decorator';
import { DbExceptionFilter } from 'src/shared/filters/http-filters/db-exception.filter';

@Controller('teams')
@UseGuards(IsAuthenticatedGuard)
@UseFilters(DbExceptionFilter)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('count-teams')
  @Roles('admin')
  @UseGuards(RoleGuard)
  countTeams() {
    return this.teamsService.countTeams();
  }

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createTeamDto: CreateTeamDto) {
    if (!(await this.teamsService.create(createTeamDto)))
      throw new BadRequestException('cannot create a team');
  }

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', IdParamPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  update(
    @Param('id', IdParamPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(204)
  @UseGuards(RoleGuard)
  async remove(@Param('id', IdParamPipe) id: string) {
    if (!(await this.teamsService.remove(id)))
      throw new BadRequestException('cannot delete team');
  }
}
