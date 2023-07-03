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
  persistentSubscriptionToAllSettingsFromDefaults,
  streamNameFilter,
} from '@eventstore/db-client';

export type EventstoreDBTransportStrategyConfigCategory = 'order' | 'product';

export class EventstoreDBTransportStrategyConfig {
  connectionString: string;
  group: string;
  category: EventstoreDBTransportStrategyConfigCategory;

  constructor(payload: EventstoreDBTransportStrategyConfig) {
    Object.assign(this, payload);
  }
}

export class EventstoreDBTransportStrategy
  extends Server
  implements CustomTransportStrategy
{
  private client: EventStoreDBClient;
  private eventSubscription: PersistentSubscriptionToStream;
  private group: string;
  private category: EventstoreDBTransportStrategyConfigCategory;

  constructor(config: EventstoreDBTransportStrategyConfig) {
    super();
    const { connectionString, group, category } = config;
    this.client = EventStoreDBClient.connectionString(connectionString);
    this.group = group;
    this.category = category;
  }

  public async listen(callback: () => void) {
    // await this.client.deletePersistentSubscriptionToAll(this.group);
    this.listenEvent(callback);
  }

  private async listenEvent(callback: () => void) {
    try {
      await this.client.getPersistentSubscriptionToAllInfo(this.group);
      this.eventSubscription =
        this.client.subscribeToPersistentSubscriptionToAll(this.group);

      this.eventSubscription.on('data', async (resolvedEvent) => {
        await this.processEvent(resolvedEvent);
      });
      callback();
    } catch (error) {
      if (error.code == 5) {
        await this.client.createPersistentSubscriptionToAll(
          this.group,
          persistentSubscriptionToAllSettingsFromDefaults({
            startFrom: 'start',
            readBatchSize: 1,
            checkPointAfter: 50,
            checkPointLowerBound: 1,
            maxSubscriberCount: 64,
          }),
          {
            filter: streamNameFilter({
              prefixes: ['product-', 'order-'],
            }),
          },
        );
        this.listenEvent(callback);
        return;
      }

      console.error(
        new Error(
          `${EventstoreDBTransportStrategy.name} unhandle subscription error`,
        ),
      );
      process.exit(500);
    }
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
      console.log(`${this.category}: event ${message.pattern} no handler`);

      return await this.eventSubscription.nack(
        'skip',
        'No handler found',
        resolvedEvent,
      );
    }
    await handler(message.data);
    await this.eventSubscription.ack(resolvedEvent);
  }

  public async close() {
    this.eventSubscription.unsubscribe();
  }
}
