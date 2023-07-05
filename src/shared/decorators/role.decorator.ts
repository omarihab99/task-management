import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: ('admin' | 'coach' | 'trainee')[]) =>
  SetMetadata('roles', roles);
