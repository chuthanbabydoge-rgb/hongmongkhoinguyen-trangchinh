// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceRealtimeService (V2.9)
//
// Singleton WebSocket manager for the /ws/marketplace endpoint.
// Handles auto-reconnect, pause/resume, max-post capping, and change
// notification to all subscribers.
// ─────────────────────────────────────────────────────────────────────────────

export type MarketplaceEventType =
  | "LISTING_CREATED"
  | "LISTING_REMOVED"
  | "LISTING_SOLD"
  | "AUCTION_CREATED"
  | "AUCTION_CANCELLED"
  | "AUCTION_COMPLETED"
  | "BID_PLACED"
  | "PRICE_DROP"
  | "NOTIFICATION_CREATED"
  | "SELLER_LEVEL_UP"
  | "SELLER_SUSPENDED"
  | "SELLER_BANNED";

export interface FeedPost {
  id:        string;
  type:      MarketplaceEventType;
  timestamp: string;
  data:      Record<string, unknown>;
  userId?:   string;
}

export type ConnectionState = "connecting" | "connected" | "disconnected";

export interface FeedStats {
  connectionState: ConnectionState;
  reconnectCount:  number;
  messageCount:    number;
  isPaused:        boolean;
}

type Listener = (posts: FeedPost[], stats: FeedStats) => void;

const MAX_POSTS      = 500;
const BASE_DELAY_MS  = 1_500;
const MAX_DELAY_MS   = 30_000;

function buildWsUrl(): string {
  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws/marketplace`;
}

class MarketplaceRealtimeService {
  private ws:             WebSocket | null = null;
  private posts:          FeedPost[]       = [];
  private listeners:      Set<Listener>    = new Set();
  private connectionState: ConnectionState = "disconnected";
  private reconnectCount:  number          = 0;
  private messageCount:    number          = 0;
  private isPaused:        boolean         = false;
  private reconnectTimer:  ReturnType<typeof setTimeout> | null = null;
  private currentDelay:    number          = BASE_DELAY_MS;
  private started:         boolean         = false;

  // ── Public API ─────────────────────────────────────────────────────────────

  connect(): void {
    if (this.started) return;
    this.started = true;
    this._open();
  }

  disconnect(): void {
    this.started = false;
    this._clearTimer();
    this.ws?.close();
    this.ws              = null;
    this.connectionState = "disconnected";
    this._notify();
  }

  pause(): void {
    this.isPaused = true;
    this._notify();
  }

  resume(): void {
    this.isPaused = false;
    this._notify();
  }

  togglePause(): void {
    this.isPaused ? this.resume() : this.pause();
  }

  clear(): void {
    this.posts = [];
    this._notify();
  }

  getState(): { posts: FeedPost[]; stats: FeedStats } {
    return { posts: this.posts, stats: this._stats() };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately deliver current state
    listener(this.posts, this._stats());
    return () => this.listeners.delete(listener);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private _open(): void {
    if (!this.started) return;
    const url = buildWsUrl();
    if (!url) return;

    this.connectionState = "connecting";
    this._notify();

    try {
      this.ws = new WebSocket(url);
    } catch {
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.connectionState = "connected";
      this.currentDelay    = BASE_DELAY_MS;
      // Subscribe to all event types
      this.ws?.send(JSON.stringify({ action: "subscribe", events: ["ALL"] }));
      this._notify();
    };

    this.ws.onmessage = (ev: MessageEvent) => {
      try {
        const event = JSON.parse(ev.data as string) as FeedPost & { type: MarketplaceEventType };
        if (!event?.type) return;
        this.messageCount++;

        if (!this.isPaused) {
          const post: FeedPost = {
            id:        crypto.randomUUID(),
            type:      event.type,
            timestamp: event.timestamp ?? new Date().toISOString(),
            data:      event.data ?? {},
            userId:    event.userId,
          };
          // Newest first, cap at MAX_POSTS
          this.posts = [post, ...this.posts].slice(0, MAX_POSTS);
        }
        this._notify();
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror — reconnect there
    };

    this.ws.onclose = () => {
      this.ws              = null;
      this.connectionState = "disconnected";
      this._notify();
      this._scheduleReconnect();
    };
  }

  private _scheduleReconnect(): void {
    if (!this.started) return;
    this._clearTimer();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++;
      this._open();
    }, this.currentDelay);
    this.currentDelay = Math.min(this.currentDelay * 2, MAX_DELAY_MS);
  }

  private _clearTimer(): void {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private _stats(): FeedStats {
    return {
      connectionState: this.connectionState,
      reconnectCount:  this.reconnectCount,
      messageCount:    this.messageCount,
      isPaused:        this.isPaused,
    };
  }

  private _notify(): void {
    const posts = this.posts;
    const stats  = this._stats();
    for (const fn of this.listeners) fn(posts, stats);
  }
}

export const marketplaceRealtimeService = new MarketplaceRealtimeService();
