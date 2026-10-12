import {
  Logger,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Server, WebSocket } from 'ws';
import { CollabService } from './collab.service';

interface ClientSession {
  ws: WebSocket;
  workspaceId?: string;
  userId?: string;
  deviceId?: string;
  clientId?: string;
}

@WebSocketGateway({
  path: '/ws/v2',
})
export class CollabGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollabGateway.name);
  private clients = new Map<WebSocket, ClientSession>();

  constructor(private readonly collabService: CollabService) {}

  afterInit(server: Server) {
    this.logger.log('📡 Collab WebSocket Gateway initialized on /ws/v2');
  }

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const url = new URL(req.url || '', 'http://localhost');
    const pathParts = url.pathname.split('/');
    // e.g. /ws/v2/{workspace_id}
    const workspaceId = pathParts[3] || url.searchParams.get('workspace_id') || undefined;
    const token = url.searchParams.get('token') || '';
    const deviceId = url.searchParams.get('deviceId') || '';
    const clientId = url.searchParams.get('clientId') || '';

    this.clients.set(client, {
      ws: client,
      workspaceId,
      deviceId,
      clientId,
    });

    this.logger.debug(
      `🔌 Cliente conectado a WS: workspace=${workspaceId}, client_id=${clientId}`,
    );

    // Enviar confirmación o ping inicial
    client.send(JSON.stringify({ type: 'ready', server: 'AppFlowy-Cloud-NestJS' }));
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
    this.logger.debug('🔌 Cliente desconectado de WS');
  }

  @SubscribeMessage('ping')
  handlePing(client: WebSocket) {
    client.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
  }

  @SubscribeMessage('collab_update')
  async handleCollabUpdate(client: WebSocket, payload: any) {
    const session = this.clients.get(client);
    if (!session || !session.workspaceId) return;

    // Broadcast a los demás clientes del mismo workspace
    for (const [ws, s] of this.clients.entries()) {
      if (ws !== client && s.workspaceId === session.workspaceId && ws.readyState === WebSocket.OPEN) {
        ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      }
    }
  }
}
