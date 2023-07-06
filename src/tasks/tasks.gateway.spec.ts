import { Test, TestingModule } from '@nestjs/testing';
import { TasksGateway } from './tasks.gateway';
import { TasksService } from './tasks.service';

xdescribe('TasksGateway', () => {
  let gateway: TasksGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksGateway, TasksService],
    }).compile();

    gateway = module.get<TasksGateway>(TasksGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
