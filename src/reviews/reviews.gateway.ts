import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@WebSocketGateway()
export class ReviewsGateway {
  constructor(private readonly reviewsService: ReviewsService) {}

  @SubscribeMessage('createReview')
  create(@MessageBody() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @SubscribeMessage('findAllReviews')
  findAll() {
    return this.reviewsService.findAll();
  }

  @SubscribeMessage('findOneReview')
  findOne(@MessageBody() id: number) {
    return this.reviewsService.findOne(id);
  }

  @SubscribeMessage('updateReview')
  update(@MessageBody() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(updateReviewDto.id, updateReviewDto);
  }

  @SubscribeMessage('removeReview')
  remove(@MessageBody() id: number) {
    return this.reviewsService.remove(id);
  }
}
