import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection {
  constructor(
    @InjectRepository(User) private Users: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const [tokenType, token] = (
      client.handshake.headers.authorization || ''
    ).split(' ');
    if (tokenType !== 'Bearer' || !token) return client.disconnect();
    const payload = this.verifyToken(token);
    if (!payload) return client.disconnect();
    const user = await this.authUserToken(payload.userId, token);
    if (!user) return client.disconnect();
    client.join(user.role);
    if (user.team) client.join(user.team.id);
  }

  private async authUserToken(id: string, token: string) {
    return await this.Users.findOne({
      where: { id, token },
      relations: ['team'],
      select: { team: { id: true } },
    });
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
