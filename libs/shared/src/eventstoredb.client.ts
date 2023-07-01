import {
  EventStoreDBClient,
  EventTypeToRecordedEvent,
  JSONEventData,
  JSONEventType,
  jsonEvent,
} from '@eventstore/db-client';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';

export class EventstoreDBAppClient extends ClientProxy {
  private connectionString: string;
  private client: EventStoreDBClient;

  constructor(connectionString: string) {
    super();
    this.connectionString = connectionString;
  }

  async connect(): Promise<any> {
    this.client = EventStoreDBClient.connectionString(this.connectionString);
  }

  async close() {
    await this.client.dispose();
  }

  async dispatchEvent(
    packet: ReadPacket<
      EventTypeToRecordedEvent<
        JSONEventData<JSONEventType<string, any, { $correlationId: string }>>
      >
    >,
  ): Promise<any> {
    const event = jsonEvent(packet.data);

    this.client.appendToStream(packet.pattern, event, {
      expectedRevision: BigInt(Number(packet.data.revision) + 1),
    });
  }

  publish(
    packet: ReadPacket<
      EventTypeToRecordedEvent<
        JSONEventData<JSONEventType<string, any, { $correlationId: string }>>
      >
    >,
    callback: (packet: WritePacket<any>) => void,
  ) {
    const channel = `channel-${packet.data.metadata.$correlationId ?? uuid()}`;

    const subscription = this.client.subscribeToStream(channel, {
      resolveLinkTos: true,
      fromRevision: 'end',
    });

    subscription.on('data', (resolvedEvent) => {
      callback({
        response: resolvedEvent.event,
      });
      subscription.unsubscribe();
    });

    subscription.on('error', (error) => {
      callback({ err: error });
      subscription.unsubscribe();
    });

    const request = jsonEvent(packet.data);

    this.client.appendToStream(channel, request, {
      expectedRevision: 'no_stream',
    });

    return () => undefined;
  }
}
