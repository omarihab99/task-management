import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private Users: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const [tokenType, token] = (request.headers.authorization || '').split(' ');
    if (tokenType !== 'Bearer' || !token)
      throw new UnauthorizedException('token not found');
    const payload = this.verifyToken(token);
    if (!payload) throw new UnauthorizedException('expired token');
    const user = await this.authUserToken(payload.userId, token);
    if (!user) throw new UnauthorizedException('expired token');
    request['user'] = user;
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
