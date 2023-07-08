import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';

@Catch(TypeORMError)
export class DbExceptionFilter implements ExceptionFilter {
  catch(exception: TypeORMError, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();
    const column = (exception as unknown as { detail: string }).detail
      .match(/\(\w+\)/)[0]
      .slice(1, -1);
    response.status(406).json({ message: `${column} is not acceptable` });
  }
}
