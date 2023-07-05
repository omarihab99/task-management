import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class SignupPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const schema = z.object({
      name: z.string({ required_error: 'name is required' }).min(3),
      email: z.string({ required_error: 'email is required' }).email(),
      role: z
        .string({ required_error: 'role is required' })
        .refine(
          (role) => ['admin', 'trainee', 'coach'].includes(role),
          'invalid role',
        ),
    });
    const validation = schema.safeParse(value);
    if (validation.success) return validation.data;
    throw new BadRequestException(
      validation.success == false
        ? validation.error.errors.map((err) => err.message)
        : '',
    );
  }
}
