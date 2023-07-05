import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import env from 'src/config/env';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [env] }),
    JwtModule.register({
      secret: env().jwt.secret,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([Team, User]),
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
