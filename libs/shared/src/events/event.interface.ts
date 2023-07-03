import {
  EventTypeToRecordedEvent,
  JSONEventData,
  JSONEventType,
  JSONType,
  MetadataType,
} from '@eventstore/db-client';

export type EventstoreDBAppEvent<
  T extends JSONType,
  M = any,
> = EventTypeToRecordedEvent<JSONEventData<JSONEventType<string, T, M>>>;

export type IAppEvent<P extends string, D extends JSONType> = {
  pattern: P;
  data: EventstoreDBAppEvent<D>;
};
