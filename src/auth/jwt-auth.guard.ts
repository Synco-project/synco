import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.Authentication;

    if (!token) {
      throw new UnauthorizedException('Por favor, inicie sesión.');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'synco_secret_key';
      await this.jwtService.verifyAsync(token, { secret });
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}
