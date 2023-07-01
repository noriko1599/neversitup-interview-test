import {
  Server,
  CustomTransportStrategy,
  IncomingEvent,
  IncomingRequest,
} from '@nestjs/microservices';
import {
  EventStoreDBClient,
  PersistentSubscriptionToStream,
  ResolvedEvent,
} from '@eventstore/db-client';

export class EventstoreDBTransportStrategyConfig {
  connectionString: string;
  commandStream: string;
  eventStream: string;
  group: string;

  constructor(payload: EventstoreDBTransportStrategyConfig) {
    Object.assign(this, payload);
  }
}

export class EventstoreDBTransportStrategy
  extends Server
  implements CustomTransportStrategy
{
  private client: EventStoreDBClient;
  private commandSubscription: PersistentSubscriptionToStream;
  private eventSubscription: PersistentSubscriptionToStream;
  private commandStream: string;
  private eventStream: string;
  private group: string;

  constructor(config: EventstoreDBTransportStrategyConfig) {
    super();
    const { connectionString, commandStream, eventStream, group } = config;
    this.client = EventStoreDBClient.connectionString(connectionString);
    this.commandStream = commandStream;
    this.eventStream = eventStream;
    this.group = group;
  }

  public async listen(callback: () => void) {
    this.listenCommand();
    this.listenEvent();

    callback();
  }

  private async listenCommand() {
    this.commandSubscription =
      this.client.subscribeToPersistentSubscriptionToStream(
        this.commandStream,
        this.group,
      );

    this.commandSubscription.on('data', (resolvedEvent) =>
      this.processCommand(resolvedEvent),
    );
  }
  private async listenEvent() {
    this.eventSubscription =
      this.client.subscribeToPersistentSubscriptionToStream(
        this.eventStream,
        this.group,
      );

    this.eventSubscription.on('data', (resolvedEvent) =>
      this.processEvent(resolvedEvent),
    );
  }

  private async processEvent(resolvedEvent: ResolvedEvent) {
    const { event } = resolvedEvent;

    if (!event) {
      throw new Error(
        `No event in resolvedEvent ${JSON.stringify(resolvedEvent, null, 2)}`,
      );
    }

    const message: IncomingEvent = {
      pattern: event.type,
      data: event,
    };

    const handler = this.getHandlerByPattern(message.pattern);

    if (!handler) {
      console.log(`event ${message.pattern} no handler`);
      await this.eventSubscription.nack(
        'park',
        'No handler found',
        resolvedEvent,
      );
      return;
    }

    await handler(message.data);
    await this.eventSubscription.ack(resolvedEvent);
  }

  private async processCommand(resolvedEvent: ResolvedEvent) {
    const { event } = resolvedEvent;

    if (!event) {
      throw new Error(
        `No event in resolvedEvent ${JSON.stringify(resolvedEvent, null, 2)}`,
      );
    }

    const message: IncomingEvent = {
      pattern: event.type,
      data: event,
    };

    const handler = this.getHandlerByPattern(message.pattern);

    if (!handler) {
      console.log(`command ${message.pattern} no handler`);
      await this.commandSubscription.nack(
        'park',
        'No handler found',
        resolvedEvent,
      );
      return;
    }

    await handler(message.data);
    await this.commandSubscription.ack(resolvedEvent);
  }

  public async close() {
    this.eventSubscription.unsubscribe();
    this.commandSubscription.unsubscribe();
  }
}
