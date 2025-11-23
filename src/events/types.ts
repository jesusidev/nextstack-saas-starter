// Shared event types to avoid circular imports
export interface AppEvent<PayloadType = unknown> extends Event {
  detail: PayloadType;
}
