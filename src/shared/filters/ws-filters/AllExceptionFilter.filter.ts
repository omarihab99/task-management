import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TypeORMError } from 'typeorm';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const client: Server = host.switchToWs().getClient();
    if (exception instanceof HttpException)
      client.emit('errors', exception.getResponse());
    else if (exception instanceof WsException)
      client.emit('errors', exception.message);
    else if (exception instanceof TypeORMError) {
      const detail = (exception as unknown as { detail: string }).detail;
      client.emit('errors', detail);
    } else console.log(exception);
  }
}
