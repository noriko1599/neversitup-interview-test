import {
  EventTypeToRecordedEvent,
  JSONEventData,
  JSONEventType,
  JSONType,
  MetadataType,
} from '@eventstore/db-client';

export type IAppEvent<P extends string, D extends JSONType> = {
  pattern: P;
  data: EventTypeToRecordedEvent<
    JSONEventData<JSONEventType<string, D, MetadataType>>
  >;
};
