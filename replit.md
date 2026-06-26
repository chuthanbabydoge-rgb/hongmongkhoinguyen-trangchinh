<div align="center">

```
██╗   ██╗███╗   ██╗██╗██╗   ██╗███████╗██████╗ ███████╗███████╗
██║   ██║████╗  ██║██║██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
██║   ██║██╔██╗ ██║██║██║   ██║█████╗  ██████╔╝███████╗█████╗  
██║   ██║██║╚██╗██║██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  
╚██████╔╝██║ ╚████║██║ ╚████╔╝ ███████╗██║  ██║███████║███████╗
 ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
                              H  U  B
```

**Cổng vào chính của toàn bộ Universe Ecosystem**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

</div>

---

## 🌌 Giới thiệu

**Universe Hub** là trung tâm điều phối của hệ sinh thái Universe — quản lý identity, wallet, inventory, marketplace, và launcher cho tất cả ứng dụng trong ecosystem. Một nền tảng game-fi đầy đủ với hàng trăm tính năng được tích hợp chặt chẽ.

---

## 🏗️ Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                      Universe Hub                           │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  React 19    │    │  Express 5   │    │  PostgreSQL  │  │
│  │  + Vite      │◄──►│  Port 8080   │◄──►│  + Drizzle   │  │
│  │  Port 5000   │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                              │
│         └────── WebSocket ───┘                              │
│                /ws/marketplace                              │
└─────────────────────────────────────────────────────────────┘
```

### Nguyên tắc thiết kế

| Quyết định | Mô tả |
|---|---|
| 🔄 **Dual-repo pattern** | Mỗi data layer có InMemory repo (dev) + Supabase repo (prod). `container.ts` chọn tự động |
| 🛡️ **Fallback repos** | Wrapper thử Supabase trước, rồi InMemory — app chạy ngay cả khi không có credentials |
| 🔑 **No local auth** | Identity đến từ Universe Account (AccountBridge). Hub không lưu password |
| 🚀 **Registry-first launcher** | AppLauncherService validate app qua AppRegistryService trước khi cấp SSO token |

---

## 🛠️ Tech Stack

<table>
<tr>
<td>

**Backend**
- 🟢 Node.js 20
- 🔷 TypeScript 5.9
- ⚡ Express 5 (port 8080)
- 🐘 PostgreSQL + Drizzle ORM
- ✅ Zod v4 validation
- 📦 esbuild bundler

</td>
<td>

**Frontend**
- ⚛️ React 19
- ⚡ Vite (port 5000)
- 🎨 Tailwind CSS 4
- 🧩 Shadcn UI components
- 🔗 TanStack Query
- 🛣️ Wouter routing

</td>
<td>

**Infrastructure**
- 📦 pnpm workspaces
- 🔌 WebSockets (`ws`)
- 🔄 Orval (API codegen)
- 📊 OpenAPI spec
- 🔐 Supabase (optional)
- 🌐 Real-time events

</td>
</tr>
</table>

---

## 🎮 Modules & Features

### 💰 Kinh tế & Giao dịch
| Module | Mô tả |
|---|---|
| 💳 **Wallet** | Quản lý Credits / XU / Token, lịch sử giao dịch |
| 🛒 **Marketplace** | Listings, đấu giá, bids, watchlists, saved searches |
| 🏭 **Crafting** | Tạo vật phẩm, công thức, nâng cấp, enchanting |
| 🏪 **NPC Shop** | Mua bán với NPC, Economy dashboard |

### 👤 Nhân vật & Chiến đấu
| Module | Mô tả |
|---|---|
| 🧙 **Character** | Hồ sơ nhân vật, skill tree, equipment, appearance |
| ⚔️ **Combat** | Hệ thống chiến đấu, ranking, lịch sử |
| 🐉 **Dungeon & Raid** | Hang ngục, raid boss, leaderboard |
| 💀 **Boss AI** | Boss thế giới, sự kiện thời gian thực |
| 🏆 **PvP Arena** | Arena 1v1, xếp hạng MMR, giải đấu |

### 🌍 Thế giới & Xã hội
| Module | Mô tả |
|---|---|
| 🌐 **Worlds** | Tạo và quản lý thế giới, sự kiện thế giới |
| 🏛️ **Guild** | Hội đoàn, tuyển thành viên, đóng góp |
| 💬 **Chat** | Chat cộng đồng, nhắn tin riêng |
| 📜 **Quest** | Hệ thống nhiệm vụ, tiến độ, phần thưởng |

### 🐾 Sinh vật & Đặc biệt
| Module | Mô tả |
|---|---|
| 🐇 **Pets & Mounts** | Thú cưng, ngồi, kỹ năng, tiến hóa |
| 🤖 **Nova AI** | AI companion, gợi ý, bộ nhớ hội thoại |
| 🎨 **Creator** | Tạo project, publish, fork, asset library |
| 📊 **Reputation** | Điểm danh tiếng, thành tựu, leaderboard |

---

## 📁 Cấu trúc thư mục

```
universe-hub/
├── 📦 artifacts/
│   ├── 🖥️  api-server/          ← Express backend
│   │   └── src/
│   │       ├── models/           ← Domain models
│   │       ├── repositories/     ← Interfaces + InMemory + Supabase
│   │       ├── services/         ← Business logic
│   │       ├── controllers/      ← HTTP handlers
│   │       ├── routes/           ← Express routers
│   │       ├── realtime/         ← WebSocket & Event buses
│   │       └── container.ts      ← Dependency injection
│   ├── ⚛️   universe-hub/        ← React frontend (port 5000)
│   ├── 📊  ecosystem-analytics/  ← Analytics dashboard (port 3002)
│   └── 💳  wallet-app/          ← Wallet mini-app (port 3001)
├── 📚 lib/
│   ├── 🗄️  db/src/schema/       ← Drizzle schema (source of truth)
│   └── 📋  api-spec/            ← OpenAPI spec (source of truth)
└── 🔧 package.json              ← pnpm workspace root
```

---

## 🚀 Khởi động

```bash
# API Server (port 8080)
pnpm --filter @workspace/api-server run dev

# Frontend (port 5000)
PORT=5000 pnpm --filter @workspace/universe-hub run dev

# Typecheck toàn bộ
pnpm run typecheck

# Build tất cả packages
pnpm run build

# Tái sinh API hooks từ OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema thay đổi (dev only)
pnpm --filter @workspace/db run push
```

---

## 🔐 Environment Variables

| Variable | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✅ Required | PostgreSQL connection string |
| `SUPABASE_URL` | ⚪ Optional | Khi set → dùng Supabase repositories |
| `SUPABASE_ANON_KEY` | ⚪ Optional | Supabase anonymous key |

---

## 🔌 API Endpoints chính

### 🚀 App Launcher (HUB-3)
```
POST   /api/launcher/launch     → { app, launchUrl, accessToken, expiresAt }
GET    /api/launcher/recent     → Ứng dụng gần đây
GET    /api/launcher/favorites  → Ứng dụng yêu thích
GET    /api/launcher/dashboard  → Dashboard launcher đầy đủ
DELETE /api/launcher/history    → Xóa lịch sử
```

### 🎨 Creator (HUB-24)
```
GET    /api/creator/dashboard            → Dashboard creator
POST   /api/creator/projects             → Tạo project mới
GET    /api/creator/projects/public      → Projects công khai
POST   /api/creator/projects/:id/publish → Publish project
POST   /api/creator/projects/:id/fork    → Fork project
GET    /api/creator/assets               → Asset library
```

---

## ⚠️ Gotchas

> **Đọc trước khi sửa:**

- 🚫 **Pre-existing errors** — `marketplaceSavedSearch.test.ts`, `marketplaceSearch.test.ts`, `marketplaceReputationController.ts` có lỗi typecheck cũ → **KHÔNG sửa** trừ khi được yêu cầu
- 🔨 **Build trước khi chạy** — `Start API Server` workflow chạy `pnpm run start` (không phải `dev`) → cần build trước: `node ./build.mjs`
- 🔀 **Vite proxy** — `/api/*` → `localhost:8080`, `/ws/*` → `ws://localhost:8080`
- 📝 **DB enums** — Khi thêm giá trị mới vào `ActivityType` / `NotificationType`, phải update cả file schema Drizzle (`activities.ts`, `notifications.ts`) rồi `pnpm db push`

---

## 🗺️ Pointers cho developer

| Cần tìm | Xem ở đâu |
|---|---|
| DB schema | `lib/db/src/schema/index.ts` |
| Dependency injection | `artifacts/api-server/src/container.ts` |
| API routes entry | `artifacts/api-server/src/routes/index.ts` |
| Frontend routing | `artifacts/universe-hub/src/App.tsx` |
| Sidebar nav | `artifacts/universe-hub/src/components/layout/Sidebar.tsx` |
| Workspace setup | `.local/skills/pnpm-workspace/SKILL.md` |

---

## 📌 User preferences

- Logs service và error messages dùng **tiếng Việt** (theo phong cách codebase hiện tại)
- Sprint reports phải gồm: files created/modified, API endpoints, test results, typecheck status, sample responses, acceptance criteria

---

<div align="center">

```
  ✦ UNIVERSE ECOSYSTEM ✦
  Built with ❤️ — Stay Legendary
```

[![Status](https://img.shields.io/badge/STATUS-ONLINE-00ff88?style=for-the-badge)](.)
[![Version](https://img.shields.io/badge/SYSTEM-v4.7.2-6366f1?style=for-the-badge)](.)
[![HUB](https://img.shields.io/badge/HUB-24_MODULES-f59e0b?style=for-the-badge)](.)

</div>
