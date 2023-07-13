import { Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import {
  UpdateAssignmentDto,
  UpdateStatusDto,
} from './dto/update-assignment.dto';
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
    data.task = task as any;
    data['user'] = user;
    const assignment = this.Assignments.create({
      id: uuid(),
      ...(data as any),
    });
    const savedAssignment = (await this.Assignments.save(
      assignment,
    )) as unknown as Assignment;
    return await this.Assignments.findOne({
      where: { id: savedAssignment.id },
      ...this.assignmentFilter,
    });
  }

  async findAll() {
    return await this.Assignments.find(this.assignmentFilter);
  }

  async findOne(id: string) {
    const assignment = await this.Assignments.findOne({
      where: { id },
      ...this.assignmentFilter,
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
    await this.Assignments.update({ id: data.id }, data);
    return await this.Assignments.findOne({
      where: { id: data.id },
      ...this.assignmentFilter,
    });
  }

  async updateStatus(userId: string, data: UpdateStatusDto) {
    const user = await this.Users.findOneBy({ id: userId });
    const assignment = await this.Assignments.findOne({
      where: { id: data.id },
      relations: ['user', 'reviews', 'feedbacks'],
      select: {
        user: { id: true },
        reviews: { id: true },
        feedbacks: { id: true },
      },
    });
    if (!assignment) throw new WsException('assignment not found');
    if (data.status === 'ask feedback') {
      if (user.id !== assignment.user.id)
        throw new WsException('cannot edit this assignment');
      if (assignment.reviews.length < 2)
        throw new WsException('must be reviewed by 2 users');
    } else if (data.status === 'done' && user.role !== 'coach') {
      if (!assignment.feedbacks)
        throw new WsException('assignment has not a feedback');
      throw new WsException('Forbidden');
    } else throw new WsException('cannot udpate status');
    await this.Assignments.update(
      { id: assignment.id },
      { status: data.status },
    );
    return await this.Assignments.findOne({
      where: { id: data.id },
      ...this.assignmentFilter,
    });
  }

  async remove(userId: string, id: string) {
    const assignment = await this.Assignments.findOne({
      where: { id },
      ...this.assignmentFilter,
    });
    if (!assignment) throw new WsException('assignment not found');
    if (assignment.user.id !== userId)
      throw new WsException('cannot edit this assignment');
    await this.Assignments.delete({ id });
    return assignment;
  }

  async getCountUsersWhoAssignTasks() {
    const queryBuilder = this.Tasks.createQueryBuilder('tasks');
    queryBuilder
      .innerJoinAndSelect('tasks.assignments', 'assignments')
      .select('tasks.id', 'id')
      .addSelect('tasks.title', 'title')
      .addSelect('tasks.topic', 'topic')
      .addSelect('tasks.sprint', 'sprint')
      .addSelect('tasks.deadlineAt', 'deadline')
      .addSelect('tasks.createdAt', 'createdAt')
      .addSelect('tasks.updatedAt', 'updatedAt')
      .addSelect('count(assignments)', 'count')
      .groupBy('tasks.id');
    return await queryBuilder.getRawMany();
  }
  async getCountUsersWhoAssignTaskById(taskId: string) {
    const queryBuilder = this.Tasks.createQueryBuilder('tasks');
    queryBuilder
      .innerJoinAndSelect('tasks.assignments', 'assignments')
      .where('tasks.id=:taskId', { taskId })
      .select('tasks.id', 'id')
      .addSelect('tasks.title', 'title')
      .addSelect('tasks.topic', 'topic')
      .addSelect('tasks.sprint', 'sprint')
      .addSelect('tasks.deadlineAt', 'deadline')
      .addSelect('tasks.createdAt', 'createdAt')
      .addSelect('tasks.updatedAt', 'updatedAt')
      .addSelect('count(assignments)', 'count')
      .groupBy('tasks.id');
    return await queryBuilder.getRawOne();
  }

  private assignmentFilter = {
    relations: ['user', 'task', 'user.team', 'reviews'],
    select: {
      id: true,
      source: true,
      status: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: {
        id: true,
        name: true,
        email: false,
        team: { id: true, name: true },
      },
      task: {
        id: true,
        title: true,
        topic: true,
        sprint: true,
        deadlineAt: true,
      },
    },
  };
}
