import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Not, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { IsAuthenticatedGuard } from 'src/shared/guards/is-authenticated.guard';

@Injectable()
@UseGuards(IsAuthenticatedGuard)
export class TasksService {
  constructor(@InjectRepository(Task) private Tasks: Repository<Task>) {}
  async create(createTaskDto: CreateTaskDto) {
    // if (await this.Tasks.findOne({ where: { title: createTaskDto.title } }))
    //   throw new BadRequestException('task already exists');
    return await this.Tasks.save({ id: uuid(), ...createTaskDto });
  }
  async findAll() {
    return await this.Tasks.find();
  }

  async findOne(id: string) {
    const task = await this.Tasks.findOne({ where: { id } });
    if (!task) throw new BadRequestException('task not found');
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    if (
      updateTaskDto.title &&
      (await this.Tasks.findOne({
        where: { title: updateTaskDto.title, id: Not(id) },
      }))
    )
      throw new BadRequestException('task is already exists');
    const task = await this.Tasks.findOne({ where: { id } });
    if (!task) throw new BadRequestException('task not found');
    return await this.Tasks.save({ ...task, ...updateTaskDto });
  }

  async remove(id: string) {
    const task = await this.Tasks.findOne({ where: { id } });
    if (!task) throw new BadRequestException('task not found');
    this.Tasks.remove(task);
    return task;
  }
}
