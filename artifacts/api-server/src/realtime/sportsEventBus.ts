// ─────────────────────────────────────────────────────────────────────────────
// Sports Event Bus — HUB-26
// ─────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "events";

export type SportsEventType =
  | "SPORT_CREATED"
  | "LEAGUE_CREATED"
  | "SEASON_CREATED"
  | "TEAM_CREATED"
  | "MATCH_CREATED"
  | "MATCH_STARTED"
  | "MATCH_FINISHED"
  | "GOAL_SCORED"
  | "POINT_SCORED"
  | "TOURNAMENT_CREATED"
  | "TOURNAMENT_FINISHED"
  | "CHAMPION_CROWNED"
  | "PLAYER_TRANSFERRED"
  | "AWARD_GRANTED";

export interface SportsEvent {
  type:    SportsEventType;
  payload: Record<string, unknown>;
}

class SportsEventBus extends EventEmitter {
  emit(event: SportsEventType, payload: Record<string, unknown>): boolean {
    return super.emit(event, { type: event, payload });
  }

  on(event: SportsEventType, listener: (e: SportsEvent) => void): this {
    return super.on(event, listener);
  }
}

export const sportsEventBus = new SportsEventBus();
