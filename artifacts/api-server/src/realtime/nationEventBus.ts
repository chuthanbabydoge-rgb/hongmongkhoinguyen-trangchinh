import { EventEmitter } from "events";

export type NationEventType =
  | "NATION_CREATED"
  | "GOVERNMENT_TERM_STARTED"
  | "GOVERNMENT_TERM_ENDED"
  | "MINISTRY_CREATED"
  | "MINISTER_APPOINTED"
  | "CITIZEN_REGISTERED"
  | "CITIZENSHIP_APPROVED"
  | "PASSPORT_CREATED"
  | "VISA_GRANTED"
  | "VISA_REJECTED"
  | "LAW_CREATED"
  | "LAW_VOTED"
  | "LAW_PASSED"
  | "LAW_REJECTED"
  | "ELECTION_STARTED"
  | "ELECTION_VOTE_CAST"
  | "ELECTION_ENDED"
  | "TAX_PAID"
  | "BUDGET_APPROVED"
  | "ANNOUNCEMENT_PUBLISHED"
  | "NATIONAL_EVENT_CREATED";

export interface NationEvent {
  type:    NationEventType;
  userId?: string;
  payload: Record<string, unknown>;
}

class NationEventBus extends EventEmitter {
  publish(event: NationEvent): void {
    this.emit(event.type, event);
    this.emit("*", event);
  }

  subscribe(type: NationEventType | "*", handler: (e: NationEvent) => void): void {
    this.on(type, handler);
  }
}

export const nationEventBus = new NationEventBus();
