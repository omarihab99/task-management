import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsGateway } from './reviews.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Review } from './entities/review.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Assignment, Review])],
  providers: [ReviewsGateway, ReviewsService],
})
export class ReviewsModule {}
