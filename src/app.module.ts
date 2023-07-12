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
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';
import { AppGateway } from './app.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AssignmentsModule } from './assignments/assignments.module';
import { Assignment } from './assignments/entities/assignment.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/entities/review.entity';
import { FeedbackModule } from './feedback/feedback.module';
import { Feedback } from './feedback/entities/feedback.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [env] }),
    JwtModule.register({
      global: true,
      secret: env().jwt.secret,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: env().postgres.db,
      username: env().postgres.username,
      password: env().postgres.password,
      host: env().postgres.host,
      port: env().postgres.port,
      synchronize: true,
      logging: false,
      entities: [User, Team, Task, Assignment, Review, Feedback],
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    AuthModule,
    TeamsModule,
    TasksModule,
    AssignmentsModule,
    ReviewsModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
