
<div align="center">

```
██╗   ██╗███╗   ██╗██╗██╗   ██╗███████╗██████╗ ███████╗███████╗
██║   ██║████╗  ██║██║██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
██║   ██║██╔██╗ ██║██║██║   ██║█████╗  ██████╔╝███████╗█████╗
██║   ██║██║╚██╗██║██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝
╚██████╔╝██║ ╚████║██║ ╚████╔╝ ███████╗██║  ██║███████║███████╗
 ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
                                                                  
        ██╗  ██╗██╗   ██╗██████╗                                  
        ██║  ██║██║   ██║██╔══██╗                                 
        ███████║██║   ██║██████╔╝                                 
        ██╔══██║██║   ██║██╔══██╗                                 
        ██║  ██║╚██████╔╝██████╔╝                                 
        ╚═╝  ╚═╝ ╚═════╝ ╚═════╝                                  
```

**Cổng vào toàn bộ Universe Ecosystem**

![Node](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## 🌐 Tổng Quan

Universe Hub là **cổng vào chính** của toàn bộ Universe Ecosystem — quản lý identity, wallet, inventory, marketplace, launcher và mọi hệ thống game cho các ứng dụng trong hệ sinh thái. Được xây dựng trên kiến trúc pnpm monorepo với TypeScript end-to-end, PostgreSQL/Drizzle và React 19.

---

## 🗺️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UNIVERSE ECOSYSTEM                              │
├──────────────────────────┬──────────────────────────────────────────────┤
│      FRONTEND (5000)     │            API SERVER (8080)                 │
│  ┌────────────────────┐  │  ┌──────────────────────────────────────┐   │
│  │  React 19 + Vite   │  │  │         Express 5                    │   │
│  │  Tailwind CSS 4    │◄─┼─►│  ┌────────────┐  ┌───────────────┐  │   │
│  │  Shadcn UI         │  │  │  │ Controllers│  │   Services    │  │   │
│  │  Wouter Router     │  │  │  └────────────┘  └───────────────┘  │   │
│  └────────────────────┘  │  │  ┌────────────┐  ┌───────────────┐  │   │
│                           │  │  │Repositories│  │   EventBus    │  │   │
│  ┌────────────────────┐  │  │  └────────────┘  └───────────────┘  │   │
│  │  Wallet App (3001) │  │  └──────────────────────────────────────┘   │
│  │  Analytics  (3002) │  │                   │                          │
│  └────────────────────┘  │  ┌────────────────▼─────────────────────┐  │
│                           │  │         PostgreSQL + Drizzle ORM     │  │
└──────────────────────────┴──┴──────────────────────────────────────────┘
```

---

## 📦 Cấu Trúc Monorepo

```
universe-hub/
├── artifacts/
│   ├── api-server/          ← Express 5 backend (port 8080)
│   │   └── src/
│   │       ├── controllers/ ← HTTP request handlers
│   │       ├── services/    ← Business logic
│   │       ├── repositories/← Data access layer
│   │       ├── routes/      ← Express routers
│   │       ├── models/      ← Domain models
│   │       └── container.ts ← Dependency injection
│   ├── universe-hub/        ← Main React frontend (port 5000)
│   ├── wallet-app/          ← Wallet micro-app (port 3001)
│   └── ecosystem-analytics/ ← Analytics dashboard (port 3002)
├── lib/
│   ├── db/src/schema/       ← Drizzle schema (source of truth)
│   └── api-spec/            ← OpenAPI spec + Orval codegen
└── pnpm-workspace.yaml
```

---

## 🎮 Hệ Thống Game — HUB Modules

<table>
<thead>
<tr>
<th>Module</th>
<th>Mô tả</th>
<th>DB Tables</th>
<th>API Prefix</th>
</tr>
</thead>
<tbody>
<tr>
<td>🔐 <strong>HUB-1</strong> Account Bridge</td>
<td>SSO, identity, auth token bridge</td>
<td>—</td>
<td><code>/api/account</code></td>
</tr>
<tr>
<td>🗂️ <strong>HUB-2</strong> App Registry</td>
<td>Ecosystem app discovery & management</td>
<td>3</td>
<td><code>/api/apps</code></td>
</tr>
<tr>
<td>🚀 <strong>HUB-3</strong> App Launcher</td>
<td>SSO launch, history, favorites</td>
<td>3</td>
<td><code>/api/launcher</code></td>
</tr>
<tr>
<td>👤 <strong>HUB-4</strong> Profile & Wallet</td>
<td>User profile, Credits/XU/Token</td>
<td>5</td>
<td><code>/api/profile</code> <code>/api/wallet</code></td>
</tr>
<tr>
<td>📦 <strong>HUB-5</strong> Application Registry</td>
<td>User-scoped app subscriptions</td>
<td>4</td>
<td><code>/api/registry</code></td>
</tr>
<tr>
<td>🏪 <strong>HUB-6</strong> Marketplace</td>
<td>Listings, auctions, bids, watchlists</td>
<td>12</td>
<td><code>/api/marketplace</code></td>
</tr>
<tr>
<td>🎒 <strong>HUB-7</strong> Inventory</td>
<td>Item browser across all apps</td>
<td>4</td>
<td><code>/api/inventory</code></td>
</tr>
<tr>
<td>🔔 <strong>HUB-8</strong> Notifications</td>
<td>Realtime push, notification center</td>
<td>3</td>
<td><code>/api/notifications</code></td>
</tr>
<tr>
<td>⭐ <strong>HUB-9</strong> Reputation</td>
<td>XP, achievements, rank tiers</td>
<td>4</td>
<td><code>/api/reputation</code></td>
</tr>
<tr>
<td>📊 <strong>HUB-10</strong> Analytics</td>
<td>Platform-wide analytics dashboard</td>
<td>6</td>
<td><code>/api/analytics</code></td>
</tr>
<tr>
<td>⚔️ <strong>HUB-11</strong> Guild System</td>
<td>Guild creation, roles, treasury, wars</td>
<td>11</td>
<td><code>/api/guilds</code></td>
</tr>
<tr>
<td>📜 <strong>HUB-12</strong> Quest System</td>
<td>Daily/weekly quests, objectives, progress</td>
<td>8</td>
<td><code>/api/quests</code></td>
</tr>
<tr>
<td>✉️ <strong>HUB-13</strong> Mail System</td>
<td>In-game mailbox, attachments</td>
<td>4</td>
<td><code>/api/mail</code></td>
</tr>
<tr>
<td>💬 <strong>HUB-14</strong> Chat System</td>
<td>Channels, DMs, realtime messaging</td>
<td>7</td>
<td><code>/api/chat</code></td>
</tr>
<tr>
<td>🌍 <strong>HUB-15</strong> World System</td>
<td>Zones, regions, world events</td>
<td>11</td>
<td><code>/api/worlds</code></td>
</tr>
<tr>
<td>🤖 <strong>HUB-16</strong> AI System</td>
<td>Nova AI companion, conversations</td>
<td>5</td>
<td><code>/api/ai</code></td>
</tr>
<tr>
<td>🔨 <strong>HUB-17</strong> Crafting & Economy</td>
<td>Crafting, resources, NPC shops</td>
<td>14</td>
<td><code>/api/crafting</code> <code>/api/economy</code></td>
</tr>
<tr>
<td>🧙 <strong>HUB-18</strong> Character System</td>
<td>Characters, classes, skills, progression</td>
<td>12</td>
<td><code>/api/characters</code></td>
</tr>
<tr>
<td>⚔️ <strong>HUB-19</strong> Combat System</td>
<td>Turn-based battles, skills, loot</td>
<td>15</td>
<td><code>/api/combat</code></td>
</tr>
<tr>
<td>🐾 <strong>HUB-20</strong> Pet & Mount System</td>
<td>Pet companions, mounts, breeding</td>
<td>20</td>
<td><code>/api/pets</code> <code>/api/mounts</code></td>
</tr>
<tr>
<td>🏰 <strong>HUB-21</strong> Dungeon & Raid</td>
<td>5 dungeons, 4 raid bosses, loot tables</td>
<td>19</td>
<td><code>/api/dungeons</code> <code>/api/raids</code></td>
</tr>
<tr>
<td>👾 <strong>HUB-22</strong> Boss AI & World Events</td>
<td>Dynamic bosses, weather, world events</td>
<td>20</td>
<td><code>/api/bosses</code> <code>/api/world-events</code></td>
</tr>
<tr>
<td>🏆 <strong>HUB-23</strong> PvP Arena & Tournament</td>
<td>Ranked 1v1–5v5, MMR, seasons, brackets</td>
<td>18</td>
<td><code>/api/pvp</code> <code>/api/seasons</code> <code>/api/tournaments</code></td>
</tr>
</tbody>
</table>

> **Tổng cộng: 23 modules · 200+ DB tables · 300+ API endpoints**

---

## ⚙️ Tech Stack

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND                                           │
│  ├─ React 19          — UI framework                │
│  ├─ Vite 7            — Build tool & dev server     │
│  ├─ Tailwind CSS 4    — Utility-first styling       │
│  ├─ Shadcn UI         — Component library           │
│  ├─ Wouter            — Lightweight routing         │
│  ├─ TanStack Query    — Server state management     │
│  └─ Lucide React      — Icon system                 │
├─────────────────────────────────────────────────────┤
│  BACKEND                                            │
│  ├─ Express 5         — HTTP server                 │
│  ├─ Node.js 20        — Runtime                     │
│  ├─ TypeScript 5.9    — Type safety                 │
│  ├─ Drizzle ORM       — Type-safe DB queries        │
│  ├─ Zod v4            — Schema validation           │
│  ├─ ws                — WebSockets (/ws/marketplace)│
│  └─ Pino              — Structured logging          │
├─────────────────────────────────────────────────────┤
│  DATA & INFRA                                       │
│  ├─ PostgreSQL        — Primary database            │
│  ├─ Drizzle Kit       — Schema migrations           │
│  ├─ Orval             — API client codegen          │
│  ├─ OpenAPI 3.0       — API specification           │
│  └─ esbuild           — Production bundler          │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Khởi Động Dự Án

### Yêu Cầu
- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Cài Đặt

```bash
# Clone và cài dependencies
pnpm install

# Đẩy schema lên database
pnpm --filter @workspace/db run push

# Khởi động API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Khởi động frontend (port 5000)
pnpm --filter @workspace/universe-hub run dev
```

### Biến Môi Trường

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SUPABASE_URL` | ⬜ | Supabase endpoint (tùy chọn) |
| `SUPABASE_ANON_KEY` | ⬜ | Supabase anon key (tùy chọn) |

> Nếu không có Supabase, hệ thống tự động dùng InMemory repositories.

---

## 🗃️ Database Schema

```
Dual-repo pattern:
  ┌─────────────────────────────┐
  │     isSupabaseConfigured()  │
  │                             │
  │  YES ──► SupabaseRepo       │
  │           └─► FallbackRepo  │
  │                └─► InMemory │
  │  NO  ──► InMemoryRepo       │
  └─────────────────────────────┘
```

Schema được định nghĩa tập trung tại `lib/db/src/schema/`, chia thành các file:
- `index.ts` — marketplace, inventory, notifications, reputation, achievements
- `appRegistry.ts` — ecosystem apps, user subscriptions
- `guild.ts` — guild system (11 tables)
- `quest.ts` — quest system (8 tables)
- `chat.ts` — chat system (7 tables)
- `world.ts` — world system (11 tables)
- `crafting.ts` — crafting & economy (14 tables)
- `character.ts` — character system (12 tables)
- `combat.ts` — combat system (15 tables)
- `pets.ts` — pet & mount system (20 tables)
- `dungeon.ts` — dungeon & raid (19 tables)
- `boss.ts` — boss AI & world events (20 tables)
- `pvp.ts` — PvP arena & tournament (18 tables)

---

## 🔄 Luồng Dữ Liệu Realtime

```
Client ──WebSocket──► /ws/marketplace ──► MarketplaceWebSocketServer
                                               │
                         ┌─────────────────────┤
                         │                     │
                    PvP Events           World Events
                    Boss Events          Weather Updates
```

---

## 🛠️ Các Lệnh Thường Dùng

```bash
# Typecheck toàn bộ project
pnpm run typecheck

# Build tất cả packages
pnpm run build

# Tái tạo API hooks từ OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Đẩy thay đổi schema DB (dev only)
pnpm --filter @workspace/db run push

# Chạy Wallet App (port 3001)
PORT=3001 pnpm --filter @workspace/wallet-app run dev

# Chạy Ecosystem Analytics (port 3002)
PORT=3002 pnpm --filter @workspace/ecosystem-analytics run dev
```

---

## 🏗️ Dependency Injection

```
container.ts (bootstraps everything in order)
│
├── Core: DB → Notifications → Activities → Reputation → Achievements
├── Marketplace: listings → auctions → bids → watchlists → analytics
├── Social: app-registry → launcher → social-graph
├── Game Core: guild → quest → mail → chat → world → AI
├── Economy: crafting → resources → NPC shops → economy
├── RPG: character → combat → pets → mounts
├── Endgame: dungeons → raids → bosses → world-events → weather
└── Competitive: pvp → ranking → tournament → matchmaking
```

---

## 📡 WebSocket Events

| Event | Channel | Mô tả |
|-------|---------|-------|
| `listing:created` | marketplace | Listing mới xuất hiện |
| `auction:bid` | marketplace | Có bid mới trên auction |
| `auction:ended` | marketplace | Auction kết thúc |
| `pvp:match_started` | pvp | Trận đấu PvP bắt đầu |
| `pvp:match_ended` | pvp | Trận đấu kết thúc |
| `world:event_started` | world | World event kích hoạt |
| `boss:spawned` | boss | Boss xuất hiện |
| `weather:changed` | weather | Thời tiết thay đổi |

---

## 🎯 Kiến Trúc Quyết Định

| Quyết định | Lý do |
|-----------|-------|
| **Dual-repo pattern** | Chạy được cả khi không có Supabase (dev/test) |
| **Registry-first launcher** | Bảo đảm chỉ app hợp lệ được launch với SSO token |
| **No local auth** | Identity do Universe Account quản lý (HUB-1 AccountBridge) |
| **In-memory event bus** | Đơn giản cho dev; thay bằng Redis Pub/Sub cho production |
| **OpenAPI → Orval codegen** | API contract là source of truth, frontend luôn type-safe |
| **esbuild bundle** | Build nhanh hơn tsc; CJS output tương thích Node.js 20 |

---

## ⚠️ Lưu Ý

- **Pre-existing typecheck errors** trong `marketplaceSavedSearch.test.ts`, `marketplaceSearch.test.ts`, `marketplaceReputationController.ts` — không sửa trừ khi được yêu cầu
- **Vite proxy**: `/api/*` → `localhost:8080`, `/ws/*` → `ws://localhost:8080`
- **SEED_APPS** trong `appRegistryService.ts` là nơi duy nhất đăng ký app mới (không dùng `container.ts registerApp` vì fail `isValidUrl`)
- **`userReputationRepo`** (không phải `userReputationService`) được truyền vào các service cần reputation

---

<div align="center">

```
╔═══════════════════════════════════════════╗
║   UNIVERSE HUB  ·  SYSTEM v4.7.2          ║
║   23 Modules  ·  200+ Tables  ·  300+ API ║
╚═══════════════════════════════════════════╝
```

*Built with ❤️ on the Universe Ecosystem*

</div>
