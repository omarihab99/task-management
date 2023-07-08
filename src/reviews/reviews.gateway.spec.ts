import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsGateway } from './reviews.gateway';
import { ReviewsService } from './reviews.service';

describe('ReviewsGateway', () => {
  let gateway: ReviewsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsGateway, ReviewsService],
    }).compile();

    gateway = module.get<ReviewsGateway>(ReviewsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
