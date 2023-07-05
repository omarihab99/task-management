import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    // console.log(exception.getResponse());
    const client: Server = host.switchToWs().getClient();
    if (exception instanceof HttpException)
      client.emit('errors', exception.getResponse());
    else client.emit('errors', exception.message);
  }
}
