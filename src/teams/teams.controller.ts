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
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { IdParamPipe } from 'src/users/pipes/id-param.pipe';
import { IsAuthenticatedGuard } from 'src/auth/guards/is-authenticated.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/shared/decorators/role.decorator';

@Controller('teams')
@UseGuards(IsAuthenticatedGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
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
  @UseGuards(RoleGuard)
  remove(@Param('id', IdParamPipe) id: string) {
    return this.teamsService.remove(id);
  }
}
