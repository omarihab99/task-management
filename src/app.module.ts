import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import env from './config/env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { TeamsModule } from './teams/teams.module';
import { Team } from './teams/entities/team.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [env] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: env().postgres.db,
      username: env().postgres.username,
      password: env().postgres.password,
      host: env().postgres.host,
      port: env().postgres.port,
      synchronize: true,
      logging: false,
      entities: [User, Team],
    }),
    UsersModule,
    AuthModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
