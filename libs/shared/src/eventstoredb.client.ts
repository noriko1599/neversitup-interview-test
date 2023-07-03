import {
  EventStoreDBClient,
  EventTypeToRecordedEvent,
  JSONEventData,
  JSONEventType,
  JSONType,
  jsonEvent,
} from '@eventstore/db-client';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';
export const EventstoreDBClientToken = `EventstoreDBClientToken`;
export class EventstoreDBAppClient extends ClientProxy {
  private connectionString: string;
  private _eventstoredb: EventStoreDBClient;

  get eventstoredb() {
    return this._eventstoredb;
  }

  constructor(connectionString: string) {
    super();
    this.connectionString = connectionString;
  }

  async connect(): Promise<any> {
    this._eventstoredb = EventStoreDBClient.connectionString(
      this.connectionString,
    );
  }

  async close() {
    await this._eventstoredb.dispose();
  }

  async dispatchEvent(
    packet: ReadPacket<
      EventTypeToRecordedEvent<
        JSONEventData<JSONEventType<string, any, { $correlationId: string }>>
      >
    >,
  ): Promise<any> {
    const event = jsonEvent(packet.data);
    await this._eventstoredb.appendToStream(packet.pattern, event);
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

    const subscription = this._eventstoredb.subscribeToStream(channel, {
      resolveLinkTos: true,
      fromRevision: 'end',
    });

    subscription.on('data', (resolvedEvent) => {
      if (Number(resolvedEvent.event.revision) == 0) {
        return;
      }
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

    this._eventstoredb.appendToStream(channel, request, {
      expectedRevision: 'no_stream',
    });

    return () => undefined;
  }

  createEvent<T extends JSONType>(type: string, data: T) {
    const $correlationId = uuid();

    const event = jsonEvent({
      type,
      data,
      metadata: {
        $correlationId,
      },
    });

    return event;
  }
}
