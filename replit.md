<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,50:8b5cf6,100:06b6d4&height=200&section=header&text=UNIVERSE%20HUB&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=The%20Gateway%20to%20the%20Universe%20Ecosystem&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

<br/>

[![Status](https://img.shields.io/badge/🟢_STATUS-ONLINE-00d084?style=flat-square&labelColor=0d1117)](.)
[![Modules](https://img.shields.io/badge/📦_MODULES-25_ACTIVE-6366f1?style=flat-square&labelColor=0d1117)](.)
[![Version](https://img.shields.io/badge/🚀_VERSION-v4.8.0-f59e0b?style=flat-square&labelColor=0d1117)](.)
[![DB Tables](https://img.shields.io/badge/🗄️_DB_TABLES-250+-ec4899?style=flat-square&labelColor=0d1117)](.)
[![API Routes](https://img.shields.io/badge/🔌_API_ROUTES-800+-06b6d4?style=flat-square&labelColor=0d1117)](.)

</div>

<br/>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🌌 &nbsp;Giới thiệu

> **Universe Hub** là trung tâm điều phối của hệ sinh thái Universe — quản lý identity, wallet, inventory, marketplace, và launcher cho tất cả ứng dụng trong ecosystem. Một nền tảng **game-fi đầy đủ** với hàng trăm tính năng được tích hợp chặt chẽ.

<table>
<tr>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🎮-GAME_FI-ff6b6b?style=for-the-badge" /><br/>
<sub>Economy + Combat</sub>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🌐-SOCIAL-4ecdc4?style=for-the-badge" /><br/>
<sub>Guild + Chat + Worlds</sub>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🤖-AI_POWERED-a78bfa?style=for-the-badge" /><br/>
<sub>Nova AI + Education AI</sub>
</td>
<td align="center" width="25%">
<img src="https://img.shields.io/badge/🎓-EDUCATION-06b6d4?style=for-the-badge" /><br/>
<sub>Courses + Certs + Exams</sub>
</td>
</tr>
</table>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🏗️ &nbsp;Kiến trúc tổng thể

```
╔══════════════════════════════════════════════════════════════════╗
║                    🌌  UNIVERSE  HUB                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║   ┌─────────────────┐      ┌─────────────────┐                  ║
║   │   ⚛️  React 19   │ ◄──► │  ⚡ Express 5   │                  ║
║   │   Vite  :5000   │      │   API   :8080   │                  ║
║   └────────┬────────┘      └────────┬────────┘                  ║
║            │   WebSocket /ws/*      │                            ║
║            └──────────┬────────────┘                            ║
║                       │                                          ║
║              ┌────────▼────────┐       ┌────────────────┐       ║
║              │  🐘 PostgreSQL  │       │  🔐 Supabase   │       ║
║              │  + Drizzle ORM  │       │  (optional)    │       ║
║              └─────────────────┘       └────────────────┘       ║
║                                                                  ║
║   📊 Analytics :3002      💳 Wallet App :3001                   ║
╚══════════════════════════════════════════════════════════════════╝
```

<details>
<summary><b>🔍 Nguyên tắc thiết kế</b></summary>
<br/>

| &nbsp; | Quyết định | Mô tả |
|:---:|---|---|
| 🔄 | **Dual-repo pattern** | Mỗi data layer có InMemory repo (dev) + Supabase repo (prod). `container.ts` chọn tự động |
| 🛡️ | **Fallback repos** | Wrapper thử Supabase trước, rồi InMemory — app chạy ngay cả khi không có credentials |
| 🔑 | **No local auth** | Identity đến từ Universe Account (AccountBridge). Hub không lưu password |
| 🚀 | **Registry-first launcher** | AppLauncherService validate app qua AppRegistryService trước khi cấp SSO token |

</details>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🛠️ &nbsp;Tech Stack

<div align="center">

| Layer | Technology | Role |
|:---:|:---:|---|
| ![Node](https://img.shields.io/badge/Node.js_20-339933?logo=nodedotjs&logoColor=white&style=flat-square) | ![TS](https://img.shields.io/badge/TypeScript_5.9-3178C6?logo=typescript&logoColor=white&style=flat-square) | Runtime & Language |
| ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black&style=flat-square) | ![Vite](https://img.shields.io/badge/Vite_6-646CFF?logo=vite&logoColor=white&style=flat-square) | Frontend & Bundler |
| ![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white&style=flat-square) | ![Zod](https://img.shields.io/badge/Zod_v4-3E67B1?logo=zod&logoColor=white&style=flat-square) | API & Validation |
| ![PG](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white&style=flat-square) | ![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black&style=flat-square) | Database & ORM |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) | ![Shadcn](https://img.shields.io/badge/Shadcn_UI-000000?logo=shadcnui&logoColor=white&style=flat-square) | UI Framework |
| ![TanStack](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white&style=flat-square) | ![pnpm](https://img.shields.io/badge/pnpm_workspace-F69220?logo=pnpm&logoColor=white&style=flat-square) | Data Fetching & Monorepo |

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🎮 &nbsp;Modules & Features

<div align="center">

### 💰 &nbsp;Kinh tế & Giao dịch
[![Wallet](https://img.shields.io/badge/💳_Wallet-Credits_XU_Token-f59e0b?style=flat-square)](.)
[![Marketplace](https://img.shields.io/badge/🛒_Marketplace-Listings_Auction_Bids-ef4444?style=flat-square)](.)
[![Crafting](https://img.shields.io/badge/🏭_Crafting-Recipes_Upgrade_Enchant-8b5cf6?style=flat-square)](.)
[![NPC Shop](https://img.shields.io/badge/🏪_NPC_Shop-Economy_Dashboard-10b981?style=flat-square)](.)

### ⚔️ &nbsp;Nhân vật & Chiến đấu
[![Character](https://img.shields.io/badge/🧙_Character-SkillTree_Equipment-6366f1?style=flat-square)](.)
[![Combat](https://img.shields.io/badge/⚔️_Combat-Battle_Ranking_History-dc2626?style=flat-square)](.)
[![Dungeon](https://img.shields.io/badge/🐉_Dungeon_Raid-Boss_Leaderboard-7c3aed?style=flat-square)](.)
[![Boss AI](https://img.shields.io/badge/💀_Boss_AI-World_Events_Realtime-1e293b?style=flat-square)](.)
[![PvP](https://img.shields.io/badge/🏆_PvP_Arena-1v1_MMR_Tournament-f97316?style=flat-square)](.)

### 🌍 &nbsp;Thế giới & Xã hội
[![Worlds](https://img.shields.io/badge/🌐_Worlds-Create_Manage_Events-0ea5e9?style=flat-square)](.)
[![Guild](https://img.shields.io/badge/🏛️_Guild-Members_Ranks_Contribute-84cc16?style=flat-square)](.)
[![Chat](https://img.shields.io/badge/💬_Chat-Community_DM_Realtime-06b6d4?style=flat-square)](.)
[![Quest](https://img.shields.io/badge/📜_Quest-Tasks_Progress_Rewards-eab308?style=flat-square)](.)

### 🐾 &nbsp;Sinh vật & Creator
[![Pets](https://img.shields.io/badge/🐇_Pets_Mounts-Skills_Evolution-ec4899?style=flat-square)](.)
[![Nova AI](https://img.shields.io/badge/🤖_Nova_AI-Companion_Memory-a78bfa?style=flat-square)](.)
[![Creator](https://img.shields.io/badge/🎨_Creator-Projects_Fork_Assets-f59e0b?style=flat-square)](.)
[![Reputation](https://img.shields.io/badge/📊_Reputation-Score_Achievement_Rank-64748b?style=flat-square)](.)

### 🎓 &nbsp;Education *(HUB-25 — Mới nhất)*
[![Courses](https://img.shields.io/badge/📚_Courses-5_Categories_Published-06b6d4?style=for-the-badge)](.)
[![Exams](https://img.shields.io/badge/📝_Exams-AI_Quiz_Generator-6366f1?style=for-the-badge)](.)
[![Certificates](https://img.shields.io/badge/🏅_Certificates-Auto_Issue_Verify-10b981?style=for-the-badge)](.)
[![Classrooms](https://img.shields.io/badge/🏫_Classrooms-Join_Code_Groups-f59e0b?style=for-the-badge)](.)
[![Teacher AI](https://img.shields.io/badge/🤖_AI_Teacher-Chat_Explain_Guide-a78bfa?style=for-the-badge)](.)

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📁 &nbsp;Cấu trúc thư mục

```
🌌 universe-hub/
│
├── 📦 artifacts/
│   ├── 🖥️  api-server/              ← ⚡ Express 5 backend (port 8080)
│   │   └── src/
│   │       ├── 📐 models/           ← Domain models & types
│   │       ├── 🗄️  repositories/    ← Interface + InMemory + Drizzle + Supabase
│   │       ├── ⚙️  services/        ← Business logic
│   │       ├── 🎯 controllers/      ← HTTP request handlers
│   │       ├── 🛣️  routes/          ← Express routers (800+ endpoints)
│   │       ├── 📡 realtime/         ← WebSocket & Event buses
│   │       └── 🔧 container.ts      ← Dependency injection root
│   │
│   ├── ⚛️   universe-hub/           ← React 19 + Vite frontend (port 5000)
│   ├── 📊  ecosystem-analytics/     ← Analytics dashboard (port 3002)
│   └── 💳  wallet-app/             ← Wallet mini-app (port 3001)
│
├── 📚 lib/
│   ├── 🗄️  db/src/schema/          ← Drizzle schema (source of truth)
│   └── 📋  api-spec/               ← OpenAPI spec (source of truth)
│
└── 🔧 package.json                 ← pnpm workspace root
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 &nbsp;Khởi động

<details open>
<summary><b>⚡ Quick Start Commands</b></summary>

```bash
# 🖥️  API Server (port 8080)
pnpm --filter @workspace/api-server run dev

# ⚛️  Frontend Hub (port 5000)
PORT=5000 pnpm --filter @workspace/universe-hub run dev

# 📊  Analytics (port 3002)
PORT=3002 pnpm --filter @workspace/ecosystem-analytics run dev

# 💳  Wallet App (port 3001)
PORT=3001 pnpm --filter @workspace/wallet-app run dev

# 🔍 Typecheck toàn bộ workspace
pnpm run typecheck

# 🏗️  Build tất cả packages
pnpm run build

# 🔄 Tái sinh API hooks từ OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# 🗄️  Push DB schema thay đổi (dev only)
pnpm --filter @workspace/db run push
```

</details>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🔐 &nbsp;Environment Variables

<div align="center">

| Variable | Status | Mô tả |
|---|:---:|---|
| `DATABASE_URL` | ![Required](https://img.shields.io/badge/REQUIRED-dc2626?style=flat-square) | PostgreSQL connection string |
| `SUPABASE_URL` | ![Optional](https://img.shields.io/badge/OPTIONAL-64748b?style=flat-square) | Khi set → dùng Supabase repositories |
| `SUPABASE_ANON_KEY` | ![Optional](https://img.shields.io/badge/OPTIONAL-64748b?style=flat-square) | Supabase anonymous key |

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🔌 &nbsp;API Endpoints nổi bật

<details>
<summary><b>🚀 App Launcher (HUB-3)</b></summary>

```http
POST   /api/launcher/launch     → { app, launchUrl, accessToken, expiresAt }
GET    /api/launcher/recent     → Ứng dụng gần đây
GET    /api/launcher/favorites  → Ứng dụng yêu thích
GET    /api/launcher/dashboard  → Dashboard launcher đầy đủ
DELETE /api/launcher/history    → Xóa lịch sử
```

</details>

<details>
<summary><b>🎨 Creator (HUB-24)</b></summary>

```http
GET    /api/creator/dashboard            → Dashboard creator
POST   /api/creator/projects             → Tạo project mới
GET    /api/creator/projects/public      → Projects công khai
POST   /api/creator/projects/:id/publish → Publish project
POST   /api/creator/projects/:id/fork    → Fork project
GET    /api/creator/assets               → Asset library
```

</details>

<details>
<summary><b>🎓 Education (HUB-25)</b></summary>

```http
GET    /api/education/courses              → Danh sách khoá học
POST   /api/education/courses/:id/enroll   → Đăng ký khoá học
GET    /api/education/exams                → Danh sách bài thi
POST   /api/education/exams/:id/submit     → Nộp bài thi
GET    /api/education/certificates         → Chứng chỉ của tôi
POST   /api/education/teacher/chat         → Chat với AI Teacher
GET    /api/education/classrooms           → Lớp học
POST   /api/education/homework/:id/submit  → Nộp bài tập
```

</details>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## ⚠️ &nbsp;Gotchas — Đọc trước khi sửa

> [!WARNING]
> Những điều quan trọng phải nhớ khi làm việc với codebase này:

| ⛔ | Vấn đề | Chi tiết |
|:---:|---|---|
| 🚫 | **Pre-existing errors** | `marketplaceSavedSearch.test.ts`, `marketplaceSearch.test.ts`, `marketplaceReputationController.ts` có lỗi typecheck cũ → **KHÔNG sửa** |
| 🔨 | **Build trước khi chạy** | `Start API Server` chạy `pnpm run start` → cần build trước: `node ./build.mjs` |
| 🔀 | **Vite proxy** | `/api/*` → `localhost:8080`, `/ws/*` → `ws://localhost:8080` |
| 📝 | **DB enums** | Thêm `ActivityType` / `NotificationType` → update `activities.ts` + `notifications.ts` → `pnpm db push` |

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🗺️ &nbsp;Developer Pointers

<div align="center">

| 🔍 Cần tìm | 📂 Xem ở đâu |
|---|---|
| DB schema | `lib/db/src/schema/index.ts` |
| Dependency injection | `artifacts/api-server/src/container.ts` |
| API routes entry | `artifacts/api-server/src/routes/index.ts` |
| Frontend routing | `artifacts/universe-hub/src/App.tsx` |
| Sidebar nav | `artifacts/universe-hub/src/components/layout/Sidebar.tsx` |
| Workspace setup | `.local/skills/pnpm-workspace/SKILL.md` |

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 📌 &nbsp;User Preferences

- 🇻🇳 Logs service và error messages dùng **tiếng Việt** (theo phong cách codebase hiện tại)
- 📋 Sprint reports phải gồm: files created/modified, API endpoints, test results, typecheck status, sample responses, acceptance criteria

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:8b5cf6,100:6366f1&height=120&section=footer&text=Stay%20Legendary&fontSize=28&fontColor=ffffff&fontAlignY=65&animation=fadeIn" width="100%"/>

[![Status](https://img.shields.io/badge/🟢_SYSTEM-ONLINE-00d084?style=for-the-badge&labelColor=0d1117)](.)
[![Version](https://img.shields.io/badge/⚡_VERSION-v4.8.0-6366f1?style=for-the-badge&labelColor=0d1117)](.)
[![Modules](https://img.shields.io/badge/🎮_HUB-25_MODULES-f59e0b?style=for-the-badge&labelColor=0d1117)](.)

*Built with ❤️ — Universe Ecosystem*

</div>
