import { Injectable, UseGuards } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { IsAuthenticatedGuard } from 'src/shared/guards/is-authenticated.guard';
import { WsException } from '@nestjs/websockets';

@Injectable()
@UseGuards(IsAuthenticatedGuard)
export class TasksService {
  constructor(@InjectRepository(Task) private Tasks: Repository<Task>) {}

  async create(createTaskDto: CreateTaskDto) {
    return await this.Tasks.save({ id: uuid(), ...createTaskDto });
  }

  async findAll() {
    return await this.Tasks.find();
  }

  async findOne(id: string) {
    const task = await this.Tasks.findOne({ where: { id } });
    if (!task) throw new WsException('task not found');
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    if ((await this.Tasks.update({ id }, updateTaskDto)).affected === 0)
      throw new WsException('cannot update task');
    return await this.Tasks.findOneBy({ id });
  }

  async remove(id: string) {
    const task = await this.Tasks.findOne({ where: { id } });
    if (!task) throw new WsException('task not found');
    await this.Tasks.remove(task);
    return task;
  }

  async countTasks() {
    return { count: await this.Tasks.count() };
  }
}
