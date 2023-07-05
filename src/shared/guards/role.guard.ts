import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(User) private Users: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const payload: { userId: string } = this.jwtService.verify(
      client.handshake.headers.authorization.split(' ')[1],
    );
    const user = await this.Users.findOne({ where: { id: payload.userId } });
    if (!roles.some((role) => role === user.role))
      throw new ForbiddenException();
    return true;
  }
}
