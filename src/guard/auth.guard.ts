import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUser } from 'src/common/interfaces/user.interface';



@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      req['user'] = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      } as AuthUser;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
