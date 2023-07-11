import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtService } from '@nestjs/jwt';
import {
  BadGatewayException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { AllExceptionsFilter } from 'src/shared/filters/ws-filters/AllExceptionFilter.filter';
import { FindReviewDto } from './dto/find-review.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { Socket } from 'socket.io';
import { RoleGuard } from 'src/shared/guards/role.guard';

@UsePipes(new ValidationPipe({ whitelist: true }))
@UseFilters(AllExceptionsFilter)
@WebSocketGateway()
export class ReviewsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly reviewsService: ReviewsService,
    private jwtService: JwtService,
  ) {}

  @Roles('trainee')
  @UseGuards(RoleGuard)
  @SubscribeMessage('createReview')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() createReviewDto: CreateReviewDto,
  ) {
    const userId = (
      this.jwtService.verify(
        client.handshake.headers.authorization.split(' ')[1],
      ) as { userId: string }
    ).userId;
    const review = await this.reviewsService.create(userId, createReviewDto);
    if (!review) throw new BadGatewayException('cannot create review');
    this.server.emit('createdNewReview', review);
  }

  @SubscribeMessage('findOneReview')
  async findOne(
    @ConnectedSocket() client: Socket,
    @MessageBody() findReviewDto: FindReviewDto,
  ) {
    client.emit(
      'response',
      await this.reviewsService.findOne(findReviewDto.id),
    );
  }

  @Roles('trainee')
  @UseGuards(RoleGuard)
  @SubscribeMessage('updateReview')
  async update(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateReviewDto: UpdateReviewDto,
  ) {
    this.server.emit(
      'updateExistedReview',
      await this.reviewsService.update(
        (
          this.jwtService.verify(
            client.handshake.headers.authorization.split(' ')[1],
          ) as { userId: string }
        ).userId,
        updateReviewDto,
      ),
    );
  }

  @Roles('trainee')
  @UseGuards(RoleGuard)
  @SubscribeMessage('removeReview')
  async remove(
    @ConnectedSocket() client: Socket,
    @MessageBody() findReviewDto: FindReviewDto,
  ) {
    this.server.emit(
      'removeExistedReview',
      await this.reviewsService.remove(
        (
          this.jwtService.verify(
            client.handshake.headers.authorization.split(' ')[1],
          ) as { userId: string }
        ).userId,
        findReviewDto.id,
      ),
    );
  }
}
