import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Socket, Server } from 'socket.io';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AllExceptionsFilter } from 'src/shared/filters/ws-filters/AllExceptionFilter.filter';
import { FindTaskDto } from './dto/find-task.dto';
import { Roles } from 'src/shared/decorators/role.decorator';
import { RoleGuard } from 'src/shared/guards/role.guard';
@WebSocketGateway({ transports: ['websocket'] })
@UseFilters(new AllExceptionsFilter())
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly tasksService: TasksService) {}

  @Roles('admin', 'coach')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('createTask')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    createTaskDto: CreateTaskDto,
  ) {
    this.server.emit(
      'createNewTask',
      await this.tasksService.create(createTaskDto),
    );
  }

  @SubscribeMessage('findAllTasks')
  async findAll(@ConnectedSocket() client: Socket) {
    client.emit('response', await this.tasksService.findAll());
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('findOneTask')
  async findOne(
    @ConnectedSocket() client: Socket,
    @MessageBody() findTaskDto: FindTaskDto,
  ) {
    client.emit('response', await this.tasksService.findOne(findTaskDto.id));
  }

  @Roles('admin', 'coach')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('updateTask')
  async update(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateTaskDto: UpdateTaskDto,
  ) {
    this.server.emit(
      'updateExistsTask',
      await this.tasksService.update(updateTaskDto.id, updateTaskDto),
    );
  }

  @Roles('admin', 'coach')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('removeTask')
  async remove(
    @ConnectedSocket() client: Socket,
    @MessageBody() removeTaskDto: FindTaskDto,
  ) {
    this.server.emit(
      'deleteExistsTask',
      await this.tasksService.remove(removeTaskDto.id),
    );
  }
}
