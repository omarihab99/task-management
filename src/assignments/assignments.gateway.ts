import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AllExceptionsFilter } from 'src/shared/filters/AllExceptionFilter.filter';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { FindAssignmentDto } from './dto/find-assignment.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { RoleGuard } from 'src/shared/guards/role.guard';

@WebSocketGateway()
@UseFilters(new AllExceptionsFilter())
export class AssignmentsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly assignmentsService: AssignmentsService,
    private jwtService: JwtService,
  ) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Roles('trainee')
  @UseGuards(RoleGuard)
  @SubscribeMessage('createAssignment')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() createAssignmentDto: CreateAssignmentDto,
  ) {
    const assignment = await this.assignmentsService.create(
      (
        this.jwtService.verify(
          client.handshake.headers.authorization.split(' ')[1],
        ) as { userId: string }
      ).userId,
      createAssignmentDto,
    );
    this.server.emit('createNewAssignment', assignment);
  }

  @SubscribeMessage('findAllAssignments')
  async findAll(@ConnectedSocket() client: Socket) {
    client.emit('response', await this.assignmentsService.findAll());
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('findOneAssignment')
  async findOne(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: FindAssignmentDto,
  ) {
    client.emit('response', await this.assignmentsService.findOne(body.id));
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Roles('trainee')
  @UseGuards(RoleGuard)
  @SubscribeMessage('updateAssignment')
  async update(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    const assignment = await this.assignmentsService.update(
      (
        this.jwtService.verify(
          client.handshake.headers.authorization.split(' ')[1],
        ) as { userId: string }
      ).userId,
      updateAssignmentDto,
    );
    this.server.emit('updateExistsAssignment', assignment);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Roles('trainee')
  @UseGuards(RoleGuard)
  @SubscribeMessage('removeAssignment')
  async remove(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: FindAssignmentDto,
  ) {
    const assignment = await this.assignmentsService.remove(
      (
        this.jwtService.verify(
          client.handshake.headers.authorization.split(' ')[1],
        ) as { userId: string }
      ).userId,
      body.id,
    );
    this.server.emit('deleteExistsAssignment', assignment);
  }
}