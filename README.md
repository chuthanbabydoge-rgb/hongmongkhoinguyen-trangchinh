<div align="center">

<img src="attached_assets/readme_banner.png" alt="Universe Hub Banner" width="100%" style="border-radius:12px"/>

<br/>
<br/>

<img src="https://img.shields.io/badge/-%E2%96%B6%20UNIVERSE%20HUB-000000?style=for-the-badge&logoColor=00d4ff&labelColor=000000&color=0a0a2e" />

<br/>
<br/>

> **Cổng vào chính của toàn bộ Universe Ecosystem**
> *Identity · Wallet · Inventory · Marketplace · Game · PvP · Tournament*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://orm.drizzle.team)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br/>

![Modules](https://img.shields.io/badge/🎮%20Modules-23-blueviolet?style=flat-square)
![Tables](https://img.shields.io/badge/🗃️%20DB%20Tables-200+-blue?style=flat-square)
![Endpoints](https://img.shields.io/badge/📡%20API%20Endpoints-300+-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

</div>

---

## <span style="color:#00d4ff">🌐 Tổng Quan</span>

**Universe Hub** là nền tảng metaverse toàn diện — một **pnpm monorepo** tích hợp đầy đủ từ hệ thống tài khoản, ví điện tử, cho đến các module game phức tạp như PvP Arena, Guild Wars, Dungeon Raids và Tournament Brackets.

Dự án được xây dựng theo triết lý **"single gateway, infinite worlds"** — mọi ứng dụng trong Universe Ecosystem đều đi qua Hub để xác thực danh tính, nhận SSO token, quản lý tài sản và theo dõi lịch sử hoạt động. Người dùng chỉ cần một tài khoản duy nhất để truy cập toàn bộ hệ sinh thái.

**Stack chính:** TypeScript 5.9 end-to-end, PostgreSQL với Drizzle ORM (type-safe queries không raw SQL), React 19 + Vite 7 (frontend), Express 5 (backend), Zod v4 (validation), Orval (codegen API hooks từ OpenAPI spec). Toàn bộ dùng **pnpm workspaces** — một lệnh install cho tất cả packages.

---

## <span style="color:#a78bfa">🗺️ Kiến Trúc Tổng Thể</span>

Hệ thống chia làm hai lớp chính: **Frontend** (React, port 5000) giao tiếp với **API Server** (Express 5, port 8080) qua REST và WebSocket. API Server kết nối PostgreSQL thông qua Drizzle ORM. Ngoài ra còn hai micro-app độc lập: Wallet App (port 3001) và Ecosystem Analytics (port 3002).

Mọi request API đều đi qua **Dependency Injection Container** (`container.ts`) — một file duy nhất wiring toàn bộ 23 module theo đúng thứ tự dependency. Không dùng IoC framework bên ngoài, container được viết tay để kiểm soát hoàn toàn boot order và tránh circular dependency.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           UNIVERSE ECOSYSTEM                              │
│                                                                           │
│   ╔═══════════════════╗        ╔═══════════════════════════════════╗      │
│   ║  FRONTEND (5000)  ║        ║       API SERVER (8080)           ║      │
│   ║                   ║        ║                                   ║      │
│   ║  React 19 + Vite  ║◄──────►║  Express 5 + WebSocket           ║      │
│   ║  Tailwind CSS 4   ║  REST  ║  ┌──────────┐ ┌───────────────┐  ║      │
│   ║  Shadcn UI        ║  /ws   ║  │Controllers│ │   Services    │  ║      │
│   ║  Wouter Router    ║        ║  └──────────┘ └───────────────┘  ║      │
│   ╚═══════════════════╝        ║  ┌──────────┐ ┌───────────────┐  ║      │
│                                ║  │   Repos  │ │   EventBus    │  ║      │
│   ╔═══════════════════╗        ║  └──────────┘ └───────────────┘  ║      │
│   ║  Wallet  (3001)   ║        ╚═════════════════════╤═════════════╝      │
│   ║  Analytics (3002) ║                              │                    │
│   ╚═══════════════════╝              ╔═══════════════▼══════════════╗     │
│                                      ║   PostgreSQL + Drizzle ORM   ║     │
│                                      ╚══════════════════════════════╝     │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## <span style="color:#34d399">📦 Cấu Trúc Monorepo</span>

Toàn bộ source code được tổ chức trong **pnpm workspaces** — mỗi app và thư viện là một package độc lập với `package.json` riêng, dùng chung node_modules ở root để tiết kiệm dung lượng và tăng tốc install.

```
📁 universe-hub/
├── 📁 artifacts/
│   ├── 🖥️  api-server/           ← Express 5 backend (port 8080)
│   │   └── 📁 src/
│   │       ├── 📁 controllers/   ← HTTP request handlers (parse req → gọi service → trả res)
│   │       ├── 📁 services/      ← Business logic thuần (không biết HTTP hay DB)
│   │       ├── 📁 repositories/  ← Data access layer (interface + Drizzle implementation)
│   │       ├── 📁 routes/        ← Express routers (map URL → controller method)
│   │       ├── 📁 models/        ← Domain models và TypeScript interfaces
│   │       └── 📄 container.ts   ← Dependency injection — wiring toàn bộ hệ thống
│   ├── 🌐 universe-hub/          ← Main React frontend (port 5000)
│   ├── 💳 wallet-app/            ← Wallet micro-app (port 3001)
│   └── 📊 ecosystem-analytics/   ← Analytics dashboard (port 3002)
├── 📁 lib/
│   ├── 🗃️  db/src/schema/        ← Drizzle schema — nguồn sự thật duy nhất cho DB
│   └── 📡 api-spec/              ← OpenAPI 3.0 spec + Orval codegen ra React hooks
└── 📄 pnpm-workspace.yaml
```

---

## <span style="color:#fb923c">🎮 23 HUB Modules</span>

Mỗi module là một tập hợp hoàn chỉnh: DB tables riêng, repository interface + Drizzle implementation, service layer, controller, router, và các trang frontend tương ứng. Các module giao tiếp với nhau qua **Service Injection** (không gọi chéo repository) và **EventBus** (cho realtime events).

<table>
<thead>
<tr>
<th align="center">Module</th>
<th>Mô tả chi tiết</th>
<th align="center">Tables</th>
<th>API</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center">🔐 <b>HUB-1</b></td>
<td><b>Account Bridge</b> — Cầu nối SSO giữa Hub và Universe Account. Không lưu password local. Mọi xác thực đều forward đến Account API, nhận JWT token và cache profile.</td>
<td align="center">—</td>
<td><code>/api/account</code></td>
</tr>
<tr>
<td align="center">🗂️ <b>HUB-2</b></td>
<td><b>App Registry</b> — Quản lý danh sách toàn bộ app trong Universe Ecosystem (marketplace, wallet, social, worlds, ai-studio…). Mỗi app có icon, URL, category và trạng thái active.</td>
<td align="center">3</td>
<td><code>/api/apps</code></td>
</tr>
<tr>
<td align="center">🚀 <b>HUB-3</b></td>
<td><b>App Launcher</b> — Launch bất kỳ app nào với SSO token tự động. Tracking lịch sử launch, danh sách yêu thích, và dashboard tổng hợp các app hay dùng nhất.</td>
<td align="center">3</td>
<td><code>/api/launcher</code></td>
</tr>
<tr>
<td align="center">👤 <b>HUB-4</b></td>
<td><b>Profile & Wallet</b> — Hồ sơ người dùng và ví đa tiền tệ: Credits (tiền game), XU (premium currency), Token (blockchain). Lịch sử giao dịch đầy đủ theo từng loại tiền.</td>
<td align="center">5</td>
<td><code>/api/profile</code> <code>/api/wallet</code></td>
</tr>
<tr>
<td align="center">📋 <b>HUB-5</b></td>
<td><b>Application Registry</b> — User-scoped app subscriptions. Mỗi user có thể subscribe/unsubscribe app, quản lý quyền truy cập và settings riêng cho từng app trong hệ sinh thái.</td>
<td align="center">4</td>
<td><code>/api/registry</code></td>
</tr>
<tr>
<td align="center">🏪 <b>HUB-6</b></td>
<td><b>Marketplace</b> — Chợ P2P đầy đủ tính năng: đăng listing, đặt giá mua ngay hoặc đấu giá theo thời gian thực, bid system, watchlist, saved searches, reputation người bán.</td>
<td align="center">12</td>
<td><code>/api/marketplace</code></td>
</tr>
<tr>
<td align="center">🎒 <b>HUB-7</b></td>
<td><b>Inventory</b> — Kho đồ tổng hợp trên tất cả app trong ecosystem. Filter theo app, loại item, độ hiếm. Sync realtime khi có item mới từ các module game (crafting, dungeon, combat…).</td>
<td align="center">4</td>
<td><code>/api/inventory</code></td>
</tr>
<tr>
<td align="center">🔔 <b>HUB-8</b></td>
<td><b>Notifications</b> — Trung tâm thông báo realtime. Mọi module đều push notification qua đây: bid thắng, quest hoàn thành, guild invite, boss spawn, PvP challenge, season kết thúc…</td>
<td align="center">3</td>
<td><code>/api/notifications</code></td>
</tr>
<tr>
<td align="center">⭐ <b>HUB-9</b></td>
<td><b>Reputation</b> — Hệ thống XP và thành tích toàn hệ sinh thái. Mỗi hành động (chiến thắng PvP, craft item, hoàn thành quest…) cộng XP theo rule cố định. Achievements unlock khi đạt mốc.</td>
<td align="center">4</td>
<td><code>/api/reputation</code></td>
</tr>
<tr>
<td align="center">📊 <b>HUB-10</b></td>
<td><b>Analytics</b> — Dashboard thống kê nền tảng: DAU/MAU, doanh thu marketplace, item phổ biến nhất, guild hoạt động nhất, rank phân bố PvP, tỉ lệ quest completion…</td>
<td align="center">6</td>
<td><code>/api/analytics</code></td>
</tr>
<tr>
<td align="center">⚔️ <b>HUB-11</b></td>
<td><b>Guild System</b> — Tổ chức người chơi thành guild với 5 cấp bậc (Leader → Member). Quản lý treasury chung, log hoạt động, guild wars 5v5, thư viện tài nguyên nội bộ.</td>
<td align="center">11</td>
<td><code>/api/guilds</code></td>
</tr>
<tr>
<td align="center">📜 <b>HUB-12</b></td>
<td><b>Quest System</b> — Nhiệm vụ hàng ngày/hàng tuần/chuỗi với objective tracking realtime. Quest engine lắng nghe event bus, tự động cập nhật progress và phát thưởng khi hoàn thành.</td>
<td align="center">8</td>
<td><code>/api/quests</code></td>
</tr>
<tr>
<td align="center">✉️ <b>HUB-13</b></td>
<td><b>Mail System</b> — Hộp thư nội game. Gửi/nhận mail giữa người chơi, đính kèm items hoặc Credits. Hệ thống tự động gửi mail thưởng (season rewards, achievement rewards…).</td>
<td align="center">4</td>
<td><code>/api/mail</code></td>
</tr>
<tr>
<td align="center">💬 <b>HUB-14</b></td>
<td><b>Chat System</b> — Nhắn tin realtime với channels (global, guild, trade…) và DM. Moderation tích hợp, lưu lịch sử tin nhắn, mention, read receipts.</td>
<td align="center">7</td>
<td><code>/api/chat</code></td>
</tr>
<tr>
<td align="center">🌍 <b>HUB-15</b></td>
<td><b>World System</b> — Quản lý thế giới game: zones, regions, sub-areas và world events định kỳ. World EventBus broadcast sự kiện (boss spawn, weather change) đến toàn bộ client qua WebSocket.</td>
<td align="center">11</td>
<td><code>/api/worlds</code></td>
</tr>
<tr>
<td align="center">🤖 <b>HUB-16</b></td>
<td><b>AI System</b> — Nova AI companion cá nhân hóa cho từng user. Lưu lịch sử hội thoại, có memory context, hỗ trợ nhiều provider (OpenAI, mock). Tích hợp sâu với quest/combat hints.</td>
<td align="center">5</td>
<td><code>/api/ai</code></td>
</tr>
<tr>
<td align="center">🔨 <b>HUB-17</b></td>
<td><b>Crafting & Economy</b> — Hệ thống chế tạo đồ từ nguyên liệu theo công thức. NPC Shops mua/bán tài nguyên với giá động. Economy service quản lý lạm phát và cân bằng thị trường.</td>
<td align="center">14</td>
<td><code>/api/crafting</code> <code>/api/economy</code></td>
</tr>
<tr>
<td align="center">🧙 <b>HUB-18</b></td>
<td><b>Character System</b> — Tạo và phát triển nhân vật với 6 class (Warrior, Mage, Rogue, Archer, Healer, Paladin). Skill trees phân nhánh, level cap 100, stat allocation tự do, equipment slots.</td>
<td align="center">12</td>
<td><code>/api/characters</code></td>
</tr>
<tr>
<td align="center">⚔️ <b>HUB-19</b></td>
<td><b>Combat System</b> — Chiến đấu lượt (turn-based) giữa nhân vật và monster. Skill system với cooldown, status effects (stun, burn, freeze…), loot drops theo rarity table sau chiến thắng.</td>
<td align="center">15</td>
<td><code>/api/combat</code></td>
</tr>
<tr>
<td align="center">🐾 <b>HUB-20</b></td>
<td><b>Pet & Mount System</b> — Thu phục và nuôi dưỡng pet đồng hành (buff stats trong combat). Mount tăng tốc di chuyển giữa zones. Breeding system kết hợp hai pet sinh ra con có stat kế thừa.</td>
<td align="center">20</td>
<td><code>/api/pets</code> <code>/api/mounts</code></td>
</tr>
<tr>
<td align="center">🏰 <b>HUB-21</b></td>
<td><b>Dungeon & Raid</b> — 5 dungeon nhiều tầng với boss cuối mỗi tầng, 4 raid boss yêu cầu đội nhóm 10+ người. Loot tables riêng, difficulty scaling, cooldown re-entry hàng tuần.</td>
<td align="center">19</td>
<td><code>/api/dungeons</code> <code>/api/raids</code></td>
</tr>
<tr>
<td align="center">👾 <b>HUB-22</b></td>
<td><b>Boss AI & World Events</b> — Boss AI động xuất hiện ngẫu nhiên trên bản đồ thế giới. World events có phase (chuẩn bị → hoạt động → kết thúc). Hệ thống thời tiết ảnh hưởng stats chiến đấu.</td>
<td align="center">20</td>
<td><code>/api/bosses</code> <code>/api/world-events</code></td>
</tr>
<tr>
<td align="center">🏆 <b>HUB-23</b></td>
<td><b>PvP Arena & Tournament</b> — Đấu xếp hạng 1v1 đến 5v5 với MMR system. Mùa giải 3 tháng, bảng xếp hạng 6 tier (Bronze → Legend). Tournament bracket tạo tự động, phần thưởng theo thứ hạng.</td>
<td align="center">18</td>
<td><code>/api/pvp</code> <code>/api/seasons</code> <code>/api/tournaments</code></td>
</tr>
</tbody>
</table>

<div align="center">

![Total](https://img.shields.io/badge/Total-23_Modules_·_200%2B_Tables_·_300%2B_Endpoints-blueviolet?style=for-the-badge)

</div>

---

## <span style="color:#f472b6">🖼️ Ảnh Minh Hoạ</span>

<table>
<tr>
<td width="50%" align="center">

### 🏆 PvP Arena & Tournament

<img src="attached_assets/readme_pvp.png" alt="PvP Arena" width="100%" style="border-radius:8px"/>

*Ranked Matchmaking · MMR System · Season Brackets*

</td>
<td width="50%" align="center">

### 💰 Economy & Wallet

<img src="attached_assets/readme_wallet.png" alt="Wallet Economy" width="100%" style="border-radius:8px"/>

*Credits · XU Tokens · Transaction History*

</td>
</tr>
<tr>
<td colspan="2" align="center">

### 🌍 World & Game Systems

<img src="attached_assets/readme_world.png" alt="World System" width="60%" style="border-radius:8px"/>

*Guilds · Dungeons · Raid Bosses · World Events*

</td>
</tr>
</table>

---

## <span style="color:#60a5fa">⚙️ Tech Stack</span>

Lựa chọn stack dựa trên tiêu chí: **type safety tối đa** (TypeScript ở mọi layer, Drizzle ORM không raw SQL, Zod validation), **developer experience** (Vite HMR < 100ms, Orval codegen tự động), và **scalability** (Drizzle query builder dễ tối ưu, Express 5 async/await native).

<table>
<tr>
<th align="center">🖥️ Frontend</th>
<th align="center">⚙️ Backend</th>
<th align="center">🗃️ Data & Infra</th>
</tr>
<tr>
<td>

- **React 19** — concurrent rendering, server components ready
- **Vite 7** — HMR dưới 100ms, native ESM
- **Tailwind CSS 4** — utility-first, zero dead CSS
- **Shadcn UI** — accessible component primitives
- **Wouter** — router nhẹ 2KB, no overhead
- **TanStack Query** — caching, background refetch
- **Lucide React** — 1400+ icon SVG đồng bộ

</td>
<td>

- **Express 5** — async/await native, no callback hell
- **Node.js 20** — LTS stable, native fetch API
- **TypeScript 5.9** — strict mode, type-safe toàn bộ
- **Drizzle ORM** — SQL-like API, zero magic, type inference
- **Zod v4** — validate request body trước khi vào service
- **ws** — WebSocket thuần, không dependency nặng
- **Pino** — structured JSON logging, cực nhanh

</td>
<td>

- **PostgreSQL 14+** — ACID, JSONB, full-text search
- **Drizzle Kit** — migration tự động từ schema diff
- **Orval** — generate React Query hooks từ OpenAPI spec
- **OpenAPI 3.0** — contract giữa FE và BE, single source
- **esbuild** — bundle Node.js trong < 1 giây
- **pnpm workspaces** — shared deps, monorepo-native

</td>
</tr>
</table>

---

## <span style="color:#4ade80">🚀 Khởi Động Dự Án</span>

### Yêu Cầu Môi Trường

| | Phần mềm | Phiên bản tối thiểu | Ghi chú |
|--|----------|:-------------------:|---------|
| ⚙️ | Node.js | 20 LTS | Dùng `nvm use 20` nếu cần |
| 📦 | pnpm | 9+ | `npm i -g pnpm` để cài |
| 🗃️ | PostgreSQL | 14+ | Local hoặc cloud (Supabase, Neon…) |

### Cài Đặt & Chạy

```bash
# 1. Clone và cài toàn bộ dependencies (một lệnh cho tất cả packages)
pnpm install

# 2. Copy env và điền DATABASE_URL
cp .env.example .env

# 3. Đẩy toàn bộ Drizzle schema lên database (tạo 200+ tables)
pnpm --filter @workspace/db run push

# 4. Khởi động API server — build trước, chạy sau (port 8080)
pnpm --filter @workspace/api-server run dev

# 5. Khởi động main frontend (port 5000)
pnpm --filter @workspace/universe-hub run dev
```

### Biến Môi Trường

| Biến | Bắt buộc | Mô tả |
|------|:--------:|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string. Ví dụ: `postgresql://user:pass@localhost:5432/universe` |
| `SUPABASE_URL` | ⬜ | Endpoint Supabase project. Khi có, hệ thống dùng Supabase repositories thay InMemory |
| `SUPABASE_ANON_KEY` | ⬜ | Anon key Supabase. Cần đi kèm với `SUPABASE_URL` |

> 💡 **Không có Supabase?** Không sao — hệ thống tự fallback về **InMemory repositories**. Mọi tính năng vẫn hoạt động bình thường trong dev. Chỉ cần `DATABASE_URL` để Drizzle connect.

---

## <span style="color:#fbbf24">🗃️ Database & Repository Pattern</span>

Mỗi entity trong hệ thống có **hai implementation** của cùng một interface: `SupabaseRepo` (dùng khi có credentials) và `InMemoryRepo` (fallback). `container.ts` tự chọn dựa trên `isSupabaseConfigured()`. Ngoài ra có thêm `FallbackRepo` wrapper cho các entity quan trọng — thử Supabase trước, nếu lỗi thì fallback InMemory để đảm bảo service không bị crash.

```
Mỗi entity có pattern:

  IEntityRepository (interface)
       ├── DrizzleEntityRepository   ← dùng trong production
       └── InMemoryEntityRepository  ← fallback khi không có DB creds

  container.ts:
    isSupabaseConfigured()
      ├── YES → DrizzleEntityRepository
      │          └── FallbackWrapper (Drizzle → InMemory nếu lỗi)
      └── NO  → InMemoryEntityRepository
```

Schema DB tập trung tại `lib/db/src/schema/`, mỗi module game có file riêng để dễ maintain và tránh merge conflict:

| File schema | Module | Số tables |
|-------------|--------|----------:|
| `index.ts` | Core: marketplace, inventory, notifications, reputation | 30+ |
| `guild.ts` | HUB-11 Guild System | 11 |
| `quest.ts` | HUB-12 Quest System | 8 |
| `chat.ts` | HUB-14 Chat System | 7 |
| `world.ts` | HUB-15 World System | 11 |
| `crafting.ts` | HUB-17 Crafting & Economy | 14 |
| `character.ts` | HUB-18 Character System | 12 |
| `combat.ts` | HUB-19 Combat System | 15 |
| `pets.ts` | HUB-20 Pet & Mount System | 20 |
| `dungeon.ts` | HUB-21 Dungeon & Raid | 19 |
| `boss.ts` | HUB-22 Boss AI & World Events | 20 |
| `pvp.ts` | HUB-23 PvP Arena & Tournament | 18 |

---

## <span style="color:#f87171">📡 WebSocket & Realtime Events</span>

Hệ thống realtime dùng **WebSocket thuần** (`ws` library) mount tại `/ws/marketplace`. Một server duy nhất phục vụ tất cả event types — marketplace, PvP, world events, boss AI, weather. Client subscribe theo room/topic để chỉ nhận event liên quan.

Các module game broadcast event qua **pvpEventBus** và **worldEventBus** — EventBus nội bộ (in-process), sau đó WebSocket server forward ra client. Kiến trúc này phù hợp cho dev và small-scale production; nếu scale lên multi-instance thì thay bằng Redis Pub/Sub.

| Event | Channel | Mô tả |
|-------|---------|-------|
| `listing:created` | marketplace | Item mới được đăng bán, client cập nhật danh sách ngay |
| `auction:bid` | marketplace | Có bid mới — cập nhật giá hiện tại và countdown timer |
| `auction:ended` | marketplace | Auction kết thúc — thông báo winner và tất cả bidder |
| `pvp:match_started` | pvp | Trận PvP bắt đầu — redirect cả 2 player vào arena |
| `pvp:match_ended` | pvp | Trận kết thúc — cập nhật MMR, ghi vào history |
| `world:event_started` | world | World event kích hoạt — thông báo toàn server |
| `boss:spawned` | boss | Boss xuất hiện tại coordinates cụ thể trên bản đồ |
| `weather:changed` | weather | Thời tiết thay đổi — áp dụng stat modifier cho combat |

---

## <span style="color:#a3e635">🛠️ Các Lệnh Thường Dùng</span>

```bash
# ── DEVELOPMENT ──────────────────────────────────────
# Typecheck toàn bộ project (tất cả packages)
pnpm run typecheck

# Build tất cả packages (typecheck + esbuild bundle)
pnpm run build

# ── DATABASE ─────────────────────────────────────────
# Đẩy thay đổi schema lên DB (dev only, không dùng migration)
pnpm --filter @workspace/db run push

# ── CODEGEN ──────────────────────────────────────────
# Tái tạo React Query hooks + Zod schemas từ OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# ── MICRO APPS ───────────────────────────────────────
# Chạy Wallet App (port 3001)
PORT=3001 BASE_PATH=/wallet-app pnpm --filter @workspace/wallet-app run dev

# Chạy Ecosystem Analytics (port 3002)
PORT=3002 BASE_PATH=/ pnpm --filter @workspace/ecosystem-analytics run dev
```

---

## <span style="color:#c084fc">🏗️ Dependency Injection — Thứ Tự Boot</span>

`container.ts` khởi tạo toàn bộ hệ thống theo **8 tầng** với thứ tự cố định. Tầng sau chỉ được khởi tạo sau khi tầng trước hoàn thành — đảm bảo không có service nào nhận `undefined` dependency. Services cần được inject `userReputationRepo` (repository) chứ **không phải** `userReputationService` — đây là pattern nhất quán toàn dự án.

```
container.ts bootstraps theo thứ tự (8 tầng):

  [1] CORE          DB → Notifications → Activities → Reputation → Achievements
                    └─ Foundation cho mọi module phía trên

  [2] MARKETPLACE   Listings → Auctions → Bids → Watchlists → Analytics → Pricing
                    └─ Phụ thuộc: Notifications, Activities, Reputation

  [3] SOCIAL        App Registry → Launcher → Social Graph
                    └─ Phụ thuộc: Notifications, Activities

  [4] GAME CORE     Guild → Quest → Mail → Chat → World → AI
                    └─ Phụ thuộc: Notifications, Activities, Reputation

  [5] ECONOMY       Crafting → Resources → NPC Shops → Economy
                    └─ Phụ thuộc: Inventory, Reputation, Notifications

  [6] RPG           Character → Combat → Pets → Mounts
                    └─ Phụ thuộc: Inventory, Reputation, Notifications, Activities

  [7] ENDGAME       Dungeons → Raids → Bosses → World Events → Weather
                    └─ Phụ thuộc: Combat, Character, Reputation, World

  [8] COMPETITIVE   PvP → Ranking → Tournament → Matchmaking (starts last)
                    └─ MatchmakingService khởi interval trong constructor → phải last
```

---

## <span style="color:#fb7185">🎯 Kiến Trúc Quyết Định</span>

Các quyết định thiết kế quan trọng và lý do phía sau:

| Quyết định | Lý do & Trade-off |
|-----------|-------------------|
| **Dual-repo pattern** | Dev chạy không cần Supabase credentials. Production dùng Drizzle/Postgres. Cùng interface, swap transparent. |
| **Registry-first launcher** | Trước khi generate SSO token, luôn validate app tồn tại trong registry → tránh forge URL tấn công. |
| **No local auth** | Password và session do Universe Account quản lý tập trung. Hub chỉ verify JWT token → không có attack surface về credential leak. |
| **In-memory event bus** | Zero latency trong process, đơn giản, không external dependency. Trade-off: mất event khi restart. Thay Redis khi scale multi-instance. |
| **OpenAPI → Orval codegen** | OpenAPI spec là contract duy nhất giữa FE và BE. Orval tự gen React Query hooks + Zod schemas → FE không bao giờ bị lệch kiểu với BE. |
| **esbuild bundle** | Build CJS bundle cho Node.js trong < 1 giây thay vì dùng `tsc` (> 30 giây). Source maps đầy đủ cho debugging. |
| **SEED_APPS trong appRegistryService** | `container.ts registerApp()` gọi `isValidUrl()` — fail với relative URLs. SEED_APPS bypass được → là nơi duy nhất đăng ký app mới. |
| **userReputationRepo không phải service** | Services cần đọc/ghi reputation trực tiếp (không qua HTTP layer). Inject repo thẳng → tránh circular dependency và overhead. |

---

## <span style="color:#94a3b8">⚠️ Lưu Ý Kỹ Thuật</span>

> [!NOTE]
> **Pre-existing typecheck errors** tồn tại trong `marketplaceSavedSearch.test.ts`, `marketplaceSearch.test.ts` và `marketplaceReputationController.ts` từ trước HUB-3. Không sửa trừ khi được yêu cầu cụ thể — chúng không ảnh hưởng runtime.

> [!TIP]
> **Vite proxy** tự động forward `/api/*` → `localhost:8080` và `/ws/*` → `ws://localhost:8080`. Không cần cấu hình CORS riêng trong dev. Khi deploy, cần reverse proxy (nginx/Caddy) thực hiện forward tương tự.

> [!IMPORTANT]
> **Express 5 breaking change:** `req.params["id"]` trả về `string | undefined` thay vì `string`. Luôn dùng `as string` hoặc check null. Không dùng `!` non-null assertion — dễ bị lỗi runtime.

> [!WARNING]
> **MatchmakingService** khởi động polling interval ngay trong constructor. Phải được khởi tạo **cuối cùng** trong container.ts — sau khi PvpService và tất cả dependency sẵn sàng. Khởi tạo sớm sẽ gây lỗi undefined service.

---

<div align="center">

<br/>

<img src="https://img.shields.io/badge/🌌_UNIVERSE_HUB-v4.7.2-000000?style=for-the-badge&labelColor=0a0a2e&color=1a1a4e" />

```
  ╔══════════════════════════════════════════════════╗
  ║         SYSTEM v4.7.2  //  UNIVERSE HUB          ║
  ║   23 Modules · 200+ Tables · 300+ API Endpoints  ║
  ║              Built for the Metaverse             ║
  ╚══════════════════════════════════════════════════╝
```

*Made with ❤️ — Universe Ecosystem*

</div>
