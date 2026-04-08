import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppUpdatePayload } from './interfaces/app-update.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  async handleConnection(client: Socket) {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      if (!cookieHeader) throw new Error('No cookies attached');

      const match = cookieHeader.match(/(?:^|;\s*)Authentication=([^;]*)/);
      const token = match ? match[1] : null;
      if (!token) throw new Error('No authentication token');

      const secret = this.configService.get<string>('JWT_SECRET') || 'synco_secret_key';
      await this.jwtService.verifyAsync(token, { secret });
    } catch (error: unknown) {
      this.logger.warn(`Conexión WS rechazada: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  emitAppUpdate(appId: number, data: AppUpdatePayload) {
    this.server.emit('app_update', { id: appId, ...data });
  }
}
