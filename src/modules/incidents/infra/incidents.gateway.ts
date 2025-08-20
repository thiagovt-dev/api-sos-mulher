import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/realtime', cors: { origin: '*' } })
export class IncidentsGateway {
  @WebSocketServer() server!: Server;

  emitCreated(incident: any) {
    this.server.emit('incident.created', incident);
  }

  emitUpdated(incident: any) {
    this.server.emit('incident.updated', incident);
  }
}
