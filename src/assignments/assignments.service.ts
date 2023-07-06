import { Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Assignment } from './entities/assignment.entity';
import { WsException } from '@nestjs/websockets';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(User) private Users: Repository<User>,
    @InjectRepository(Task) private Tasks: Repository<Task>,
    @InjectRepository(Assignment) private Assignments: Repository<Assignment>,
  ) {}

  async create(userId: string, data: CreateAssignmentDto) {
    const user = await this.Users.findOne({ where: { id: userId } });
    const task = await this.Tasks.findOne({ where: { id: data.task } });
    if (!task) throw new WsException('task not found');
    if (
      await this.Assignments.findOne({
        where: { user: { id: user.id }, task: { id: task.id } },
      })
    )
      throw new WsException('assignment already exists');
    const assignment = this.Assignments.create({
      id: uuid(),
      source: data.source,
    });
    if (data.status) assignment.status = data.status;
    if (data.comment) assignment.comment = data.comment;
    assignment.task = task;
    assignment.user = user;
    return await this.Assignments.save(assignment);
  }

  async findAll() {
    return await this.Assignments.find({
      relations: ['user', 'task'],
      select: {
        user: { id: true, name: true, email: true },
        task: { id: true, title: true },
      },
    });
  }

  async findOne(id: string) {
    const assignment = await this.Assignments.find({
      where: { id },
      relations: ['user', 'task'],
      select: {
        user: { id: true, name: true, email: true },
        task: { id: true, title: true },
      },
    });
    if (!assignment) throw new WsException('assignment not found');
    return assignment;
  }

  async update(userId: string, data: UpdateAssignmentDto) {
    const assignment = await this.Assignments.findOne({
      where: { id: data.id },
      relations: ['user'],
      select: { user: { id: true } },
    });
    if (!assignment) throw new WsException('assignment not found');
    if (assignment.user.id !== userId)
      throw new WsException('cannot edit this assignment');
    return await this.Assignments.save({ ...assignment, ...data });
  }

  async remove(userId: string, id: string) {
    const assignment = await this.Assignments.findOne({
      where: { id },
      relations: ['user'],
      select: { user: { id: true } },
    });
    if (!assignment) throw new WsException('assignment not found');
    if (assignment.user.id !== userId)
      throw new WsException('cannot edit this assignment');
    await this.Assignments.remove(assignment);
    return assignment;
  }
}
