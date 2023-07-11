import { Test, TestingModule } from '@nestjs/testing';
import * as io from 'socket.io-client';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksGateway } from './tasks.gateway';

xdescribe('TasksGateway', () => {
  let app: INestApplication;
  let tasksGateway: TasksGateway;
  let socketClient: io.Socket;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    // app.useWebSocketAdapter(new WsAdapter)
    await app.init();
    const address = app.getHttpServer().listen().address();
    const baseAddress = `http://[${address.address}]:${address.port}`;

    // socketClient = new WebSocket(baseAddress);
    // await app.listen(5000);
    // tasksGateway = module.get<TasksGateway>(TasksGateway);

    // const address = app.getHttpServer().listen().address();
    // const baseAddress = `http://[${address.address}]:${address.port}`;
    // socketClient = io.connect(`${baseAddress}/some-namespace`, {
    //   transports: ['websocket'],
    // });
    // socketClient = io.connect('http://localhost:5000', {
    //   transports: ['websocket'],
    //   forceNew: true,
    // });
  });

  it('should emit and receive "hello" event', (done) => {
    socketClient.emit('helloSocket', 'world');
    socketClient.on('helloSocket', (message) => {
      expect(message).toBe('world');
      done();
    });
    socketClient.on('error', (error) => {
      console.error('Socket error', error);
    });
  });

  afterAll(async () => {
    socketClient.disconnect();
    await app.close();
  });
});
