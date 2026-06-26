// ─────────────────────────────────────────────────────────────────────────────
// PvP Event Bus — HUB-23
// ─────────────────────────────────────────────────────────────────────────────

export type PvpEventType =
  | "MATCH_FOUND"
  | "MATCH_STARTED"
  | "PLAYER_KILLED"
  | "HP_UPDATED"
  | "MATCH_FINISHED"
  | "RANK_CHANGED"
  | "SEASON_STARTED"
  | "SEASON_ENDED"
  | "TOURNAMENT_STARTED"
  | "TOURNAMENT_FINISHED"
  | "QUEUE_UPDATED"
  | "TOURNAMENT_UPDATED";

export interface PvpEvent {
  type: PvpEventType;
  matchId?: string;
  userId?: string;
  targetId?: string;
  tournamentId?: string;
  seasonId?: string;
  payload: Record<string, unknown>;
}

type PvpEventHandler = (event: PvpEvent) => void;

class PvpEventBus {
  private handlers = new Map<PvpEventType, Set<PvpEventHandler>>();

  on(type: PvpEventType, handler: PvpEventHandler): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: PvpEventType, handler: PvpEventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  publish(event: PvpEvent): void {
    this.handlers.get(event.type)?.forEach((h) => {
      try { h(event); } catch { /* ignore handler errors */ }
    });
  }
}

export const pvpEventBus = new PvpEventBus();
