import { Inject, OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import { ClientKafka } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class RoutesGateway implements OnModuleInit {
  private kafkaProducer: Producer;

  @WebSocketServer()
  server: Server;

  constructor(@Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka) {}

  async onModuleInit() {
    this.kafkaProducer = await this.kafkaClient.connect();
  }

  @SubscribeMessage('new-direction')
  handleMessage(client: Socket, payload: { routeId: string }) {
    this.kafkaProducer.send({
      topic: 'route.new-direction',
      messages: [
        {
          key: 'route.new-direction',
          value: JSON.stringify({
            routeId: payload.routeId,
            clientId: client.client.id,
          }),
        },
      ],
    });
    console.log('new-direction: ' + payload.routeId + ' - ' + client.client.id);
  }

  sendPosition(data: {
    clientId: string;
    routeId: string;
    position: [number, number];
    finished: boolean;
  }) {
    const { clientId, ...rest } = data;
    const clients = this.server.sockets.connected;

    if (!(clientId in clients)) {
      console.error(
        'Client not exists, refresh React App and resend new direction',
      );
      return;
    }
    clients[clientId].emit('new-position', rest);
  }
}
