export type ServiceStatus = "online" | "degraded" | "offline";
export type ServiceEnvironment = "production" | "staging" | "development";

export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  version: string;
  lastUpdate: string;
  environment: ServiceEnvironment;
  uptime: string;
  latency: string;
}

export const SERVICES: ServiceConfig[] = [
  {
    id: "universe-account",
    name: "Universe Account",
    description: "Identity, authentication and user profile management.",
    status: "online",
    version: "v3.12.1",
    lastUpdate: "2026-06-21 14:32 UTC",
    environment: "production",
    uptime: "99.98%",
    latency: "18ms",
  },
  {
    id: "universe-wallet",
    name: "Universe Wallet",
    description: "Credits, coins, tokens and transaction ledger.",
    status: "online",
    version: "v2.8.0",
    lastUpdate: "2026-06-20 09:15 UTC",
    environment: "production",
    uptime: "99.95%",
    latency: "24ms",
  },
  {
    id: "universe-inventory",
    name: "Universe Inventory",
    description: "Asset storage, item ownership and NFT registry.",
    status: "degraded",
    version: "v1.5.4",
    lastUpdate: "2026-06-19 22:47 UTC",
    environment: "production",
    uptime: "97.41%",
    latency: "142ms",
  },
  {
    id: "universe-marketplace",
    name: "Universe Marketplace",
    description: "Peer-to-peer trading and asset exchange platform.",
    status: "online",
    version: "v4.1.3",
    lastUpdate: "2026-06-21 11:05 UTC",
    environment: "staging",
    uptime: "99.80%",
    latency: "36ms",
  },
  {
    id: "universe-ai",
    name: "Universe AI",
    description: "Inference engine powering AI Companion and NPC systems.",
    status: "offline",
    version: "v0.9.2-beta",
    lastUpdate: "2026-06-18 16:00 UTC",
    environment: "development",
    uptime: "82.10%",
    latency: "—",
  },
  {
    id: "universe-avatar",
    name: "Universe Avatar",
    description: "Cross-world avatar rendering and cosmetics service.",
    status: "online",
    version: "v2.3.7",
    lastUpdate: "2026-06-21 07:58 UTC",
    environment: "production",
    uptime: "99.92%",
    latency: "29ms",
  },
];
