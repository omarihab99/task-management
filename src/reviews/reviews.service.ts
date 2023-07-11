import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { v4 as uuid } from 'uuid';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private Reviews: Repository<Review>,
    @InjectRepository(User) private Users: Repository<User>,
    @InjectRepository(Assignment) private Assignments: Repository<Assignment>,
  ) {}

  async create(userId: string, data: CreateReviewDto) {
    const user = await this.Users.findOne({ where: { id: userId } });
    const assignment = await this.Assignments.findOne({
      where: { id: data.assignment },
      relations: ['task', 'reviews', 'user'],
      select: { task: { id: true }, reviews: { id: true }, user: { id: true } },
    });
    if (!assignment) throw new BadGatewayException('assignment not found');
    if (assignment.user.id === userId)
      throw new BadGatewayException('cannot review your self');
    if (assignment.reviews.length > 1)
      throw new WsException('there are 2 reviews on this assignment');
    if (
      (
        await this.Reviews.find({
          where: {
            user: { id: userId },
            assignment: { task: { id: assignment.task.id } },
          },
        })
      ).length > 1
    )
      throw new BadGatewayException('you already reviewed this task twice');
    return await this.Reviews.save({
      id: uuid(),
      DS: data.DS,
      QDS: data.QDS,
      comment: data.comment,
      user,
      assignment,
    });
  }

  async findOne(id: string) {
    const review = await this.Reviews.findOneBy({ id });
    if (!review) throw new WsException('review not found');
    return review;
  }

  async update(userId: string, data: UpdateReviewDto) {
    const review = await this.Reviews.findOne({
      where: { id: data.id },
      relations: ['user'],
      select: { user: { id: true } },
    });
    if (!review) throw new WsException('review not found');
    if (review.user.id !== userId) throw new WsException('not allowed');
    return await this.Reviews.update(review, data);
  }

  async remove(userId: string, id: string) {
    const review = await this.Reviews.findOne({
      where: { id },
      relations: ['user'],
      select: { user: { id: true } },
    });
    if (!review) throw new WsException('review not found');
    if (review.user.id !== userId) throw new WsException('not allowed');
    return await this.Reviews.remove(review);
  }
}
