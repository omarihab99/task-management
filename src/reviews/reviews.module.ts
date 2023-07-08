import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsGateway } from './reviews.gateway';

@Module({
  providers: [ReviewsGateway, ReviewsService]
})
export class ReviewsModule {}
