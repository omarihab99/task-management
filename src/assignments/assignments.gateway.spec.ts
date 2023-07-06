import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsGateway } from './assignments.gateway';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsGateway', () => {
  let gateway: AssignmentsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentsGateway, AssignmentsService],
    }).compile();

    gateway = module.get<AssignmentsGateway>(AssignmentsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
