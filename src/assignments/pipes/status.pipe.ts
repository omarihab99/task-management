import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import z from 'zod';

@Injectable()
export class StatusPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const schema = z.object({
      id: z.string({ required_error: 'id is required' }).uuid('invalid id'),
      status: z
        .string()
        .refine((el) => ['done', 'under review', 'ask feedback'].includes(el)),
    });

    const validation = schema.safeParse(value);
    if (validation.success) return validation.data;
    throw new WsException(
      validation.success == false
        ? validation.error.errors.map((err) => err.message)
        : '',
    );
  }
}
