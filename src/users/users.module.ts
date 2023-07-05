import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import env from 'src/config/env';
import { ConfigModule } from '@nestjs/config';
import { Team } from 'src/teams/entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
