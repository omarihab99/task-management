import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class UpdateUserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const schema = z.object({
      name: z.optional(z.string({ required_error: 'name is required' }).min(3)),
      email: z.optional(
        z.string({ required_error: 'email is required' }).email(),
      ),
      team: z.optional(z.string().uuid('invalid team id')),
      role: z.optional(
        z
          .string({ required_error: 'role is required' })
          .refine(
            (role) => ['admin', 'trainee', 'coach'].includes(role),
            'invalid role',
          ),
      ),
    });
    const validation = schema.safeParse(value);
    if (validation.success) return validation.data;
    // if (validation.success == false) console.log(validation.error.errors);
    throw new BadRequestException(
      validation.success == false
        ? validation.error.errors.map((err) => err.message)
        : '',
    );
  }
}
