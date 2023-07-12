import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackGateway } from './feedback.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Feedback } from './entities/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Assignment, Review, Feedback])],
  providers: [FeedbackGateway, FeedbackService],
})
export class FeedbackModule {}
