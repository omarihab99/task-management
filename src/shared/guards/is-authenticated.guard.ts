import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private Users: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const [tokenType, token] = (
      client.handshake.headers.authorization || ''
    ).split(' ');
    if (tokenType !== 'Bearer' || !token)
      throw new WsException('token not found');
    const payload = this.verifyToken(token);
    if (!payload) throw new WsException('expired token');
    const user = await this.authUserToken(payload.userId, token);
    if (!user) throw new WsException('expired token');
    client['user'] = user;
    return true;
  }

  private async authUserToken(id: string, token: string) {
    return await this.Users.findOne({ where: { id, token } });
  }

  private verifyToken(token: string): { userId: string } | undefined {
    try {
      const payload: { userId: string } = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}
