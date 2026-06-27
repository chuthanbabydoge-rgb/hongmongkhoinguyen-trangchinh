// ─────────────────────────────────────────────────────────────────────────────
// AppRegistryService — HUB-2
//
// Quản lý kho ứng dụng Universe ecosystem.
// Khi khởi động sẽ seed 6 ứng dụng chuẩn một cách idempotent.
//
// Architecture:
//   Controller → AppRegistryService → IAppRegistryRepository
// ─────────────────────────────────────────────────────────────────────────────

import type { IAppRegistryRepository } from "../repositories/appRegistryRepository.js";
import { APP_CATEGORIES, APP_STATUSES } from "../models/appRegistry.js";
import type {
  EcosystemApp,
  AppCategory,
  AppRegistryActivity,
  AppRegistryStats,
  RegisterAppRequest,
  UpdateAppRequest,
} from "../models/appRegistry.js";

// ─── Errors ───────────────────────────────────────────────────────────────────

export class AppRegistryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppRegistryValidationError";
  }
}

export class AppNotFoundError extends Error {
  constructor(id: string) {
    super(`App not found: ${id}`);
    this.name = "AppNotFoundError";
  }
}

export class SlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Slug already registered: ${slug}`);
    this.name = "SlugAlreadyExistsError";
  }
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9-]+$/;

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateRegisterRequest(input: RegisterAppRequest): void {
  if (!input.slug || input.slug.length === 0)
    throw new AppRegistryValidationError("slug không được rỗng");
  if (input.slug.length > 100)
    throw new AppRegistryValidationError("slug tối đa 100 ký tự");
  if (!SLUG_RE.test(input.slug))
    throw new AppRegistryValidationError("slug chỉ được chứa chữ thường, số, dấu gạch ngang");
  if (!input.name || input.name.length === 0)
    throw new AppRegistryValidationError("name không được rỗng");
  if (input.name.length > 100)
    throw new AppRegistryValidationError("name tối đa 100 ký tự");
  if (input.description !== undefined && input.description.length > 1000)
    throw new AppRegistryValidationError("description tối đa 1000 ký tự");
  if (!input.url || input.url.length === 0)
    throw new AppRegistryValidationError("url không được rỗng");
  if (!isValidUrl(input.url))
    throw new AppRegistryValidationError("url phải là URL hợp lệ");
  if (!(APP_CATEGORIES as readonly string[]).includes(input.category))
    throw new AppRegistryValidationError(`category không hợp lệ: ${input.category}`);
  if (input.status !== undefined && !(APP_STATUSES as readonly string[]).includes(input.status))
    throw new AppRegistryValidationError(`status không hợp lệ: ${input.status}`);
  if (!input.version || input.version.length === 0)
    throw new AppRegistryValidationError("version không được rỗng");
  if (input.icon !== undefined && !isValidUrl(input.icon))
    throw new AppRegistryValidationError("icon phải là URL hợp lệ");
}

function validateUpdateRequest(input: UpdateAppRequest): void {
  if (input.name !== undefined) {
    if (input.name.length === 0) throw new AppRegistryValidationError("name không được rỗng");
    if (input.name.length > 100) throw new AppRegistryValidationError("name tối đa 100 ký tự");
  }
  if (input.description !== undefined && input.description.length > 1000)
    throw new AppRegistryValidationError("description tối đa 1000 ký tự");
  if (input.url !== undefined && !isValidUrl(input.url))
    throw new AppRegistryValidationError("url phải là URL hợp lệ");
  if (input.category !== undefined && !(APP_CATEGORIES as readonly string[]).includes(input.category))
    throw new AppRegistryValidationError(`category không hợp lệ: ${input.category}`);
  if (input.status !== undefined && !(APP_STATUSES as readonly string[]).includes(input.status))
    throw new AppRegistryValidationError(`status không hợp lệ: ${input.status}`);
  if (input.icon !== undefined && !isValidUrl(input.icon))
    throw new AppRegistryValidationError("icon phải là URL hợp lệ");
  if (input.version !== undefined && input.version.length === 0)
    throw new AppRegistryValidationError("version không được rỗng");
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const REPLIT_HUB_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : "http://localhost:5000";

const SEED_APPS: Omit<EcosystemApp, "id" | "createdAt" | "updatedAt">[] = [
  {
    slug:        "account",
    name:        "Universe Account",
    description: "Quản lý danh tính, hồ sơ và xác thực trong toàn hệ sinh thái Universe",
    icon:        "https://cdn.universe.io/icons/account.png",
    url:         (process.env.UNIVERSE_ACCOUNT_API_URL ?? "https://hongmongkhoinguyen-taikhoanvutru--manifestanhthu3.replit.app").replace(/\/$/, ""),
    category:    "SECURITY",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "marketplace",
    name:        "Universe Marketplace",
    description: "Mua bán và giao dịch tài sản số giữa các ứng dụng trong hệ sinh thái",
    icon:        "https://cdn.universe.io/icons/marketplace.png",
    url:         `${REPLIT_HUB_URL}/marketplace`,
    category:    "FINANCE",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "wallet",
    name:        "Universe Wallet",
    description: "Ví đa tiền tệ: Credits, XU và Token cho toàn hệ sinh thái",
    icon:        "https://cdn.universe.io/icons/wallet.png",
    url:         `${REPLIT_HUB_URL}/wallet-app`,
    category:    "FINANCE",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "social",
    name:        "Universe Social",
    description: "Mạng xã hội nội bộ — kết nối người chơi, chia sẻ thành tích và hoạt động",
    icon:        "https://cdn.universe.io/icons/social.png",
    url:         `${REPLIT_HUB_URL}/social`,
    category:    "SOCIAL",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "guild",
    name:        "Universe Guild",
    description: "Tạo và quản lý guild, chiến đoàn, sự kiện, kho báu và bảng xếp hạng trong hệ sinh thái Universe",
    icon:        "https://cdn.universe.io/icons/guild.png",
    url:         `${REPLIT_HUB_URL}/guild`,
    category:    "SOCIAL",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "worlds",
    name:        "Universe Worlds",
    description: "Xây dựng và khám phá các thế giới ảo trong vũ trụ số",
    icon:        "https://cdn.universe.io/icons/worlds.png",
    category:    "WORLD",
    status:      "INACTIVE",
    version:     "0.1.0",
  },
  {
    slug:        "ai-studio",
    name:        "Universe AI Studio",
    description: "Công cụ AI tạo sinh: tạo nhân vật, vật phẩm và nội dung cho hệ sinh thái",
    icon:        "https://cdn.universe.io/icons/ai-studio.png",
    category:    "AI",
    status:      "INACTIVE",
    version:     "0.1.0",
  },
  {
    slug:        "analytics",
    name:        "Universe Analytics",
    description: "Bảng điều khiển phân tích thời gian thực: đo lường sức khoẻ và tăng trưởng của toàn hệ sinh thái",
    icon:        "https://cdn.universe.io/icons/analytics.png",
    url:         process.env.REPLIT_DEV_DOMAIN
                   ? `https://${process.env.REPLIT_DEV_DOMAIN.replace(/^([^.]+)/, "$1-3002")}`
                   : "http://localhost:3002",
    category:    "UTILITY",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "inventory",
    name:        "Kho đồ Universe",
    description: "Quản lý toàn bộ tài sản, vật phẩm, thú cưng, vé và tài sản thế giới của bạn trong hệ sinh thái Universe",
    icon:        "https://cdn.universe.io/icons/inventory.png",
    url:         `${REPLIT_HUB_URL}/inventory`,
    category:    "UTILITY",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "quests",
    name:        "Universe Quests",
    description: "Hệ thống nhiệm vụ và quest — hoàn thành thử thách để nhận phần thưởng Credits, Coins, Token và Reputation",
    icon:        "https://cdn.universe.io/icons/quests.png",
    url:         `${REPLIT_HUB_URL}/quests`,
    category:    "OTHER",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "crafting",
    name:        "Universe Crafting",
    description: "Hệ thống chế tạo và kinh tế Universe — thu thập tài nguyên, chế tạo vật phẩm, nâng cấp và phù chú.",
    icon:        "https://cdn.universe.io/icons/crafting.png",
    url:         `${REPLIT_HUB_URL}/crafting`,
    category:    "UTILITY",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "economy",
    name:        "Universe Economy",
    description: "Bảng thống kê kinh tế — giá thị trường tài nguyên, chỉ số giao dịch và sức khoẻ nền kinh tế.",
    icon:        "https://cdn.universe.io/icons/economy.png",
    url:         `${REPLIT_HUB_URL}/economy`,
    category:    "UTILITY",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "ai",
    name:        "Universe AI",
    description: "Nova — AI Companion thông minh của Universe Hub. Tư vấn Wallet, Quest, Marketplace, Guild và nhiều hơn nữa.",
    icon:        "https://cdn.universe.io/icons/ai.png",
    url:         `${REPLIT_HUB_URL}/ai`,
    category:    "AI",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "pvp",
    name:        "Universe PvP",
    description: "Đấu trường PvP — xếp hạng MMR, mùa giải, đấu 1v1 đến 5v5 và Guild War",
    icon:        "https://cdn.universe.io/icons/pvp.png",
    url:         `${REPLIT_HUB_URL}/pvp`,
    category:    "GAME",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "tournaments",
    name:        "Universe Tournament",
    description: "Giải đấu chính thức — thi đấu loại trực tiếp, vòng tròn, giải thưởng lớn",
    icon:        "https://cdn.universe.io/icons/tournaments.png",
    url:         `${REPLIT_HUB_URL}/tournaments`,
    category:    "GAME",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "business",
    name:        "Universe Business",
    description: "Hạ tầng doanh nghiệp Universe — quản lý công ty, nhân viên, kho hàng, nhà máy, cửa hàng và tài chính",
    icon:        "https://cdn.universe.io/icons/business.png",
    url:         `${REPLIT_HUB_URL}/business`,
    category:    "BUSINESS",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
  {
    slug:        "land",
    name:        "Universe Land",
    description: "Hạ tầng đất đai Universe — vùng, thành phố, quận, ô đất, công trình và bất động sản",
    icon:        "https://cdn.universe.io/icons/land.png",
    url:         `${REPLIT_HUB_URL}/land`,
    category:    "LAND",
    status:      "ACTIVE",
    version:     "1.0.0",
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export class AppRegistryService {
  private readonly activities: AppRegistryActivity[] = [];

  constructor(private readonly repo: IAppRegistryRepository) {}

  // ── Initialization / Seed ────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    const now = new Date().toISOString();
    for (const seed of SEED_APPS) {
      const exists = await this.repo.existsBySlug(seed.slug);
      if (!exists) {
        await this.repo.create({
          ...seed,
          id:        crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        });
      } else {
        const existing = await this.repo.findBySlug(seed.slug);
        if (existing) {
          await this.repo.update({ ...existing, ...seed, updatedAt: now });
        }
      }
    }
  }

  // ── Read ─────────────────────────────────────────────────────────────────────

  async getAllApps(): Promise<EcosystemApp[]> {
    return this.repo.findAll();
  }

  async getAppById(id: string): Promise<EcosystemApp> {
    const app = await this.repo.findById(id);
    if (!app) throw new AppNotFoundError(id);
    return app;
  }

  async getBySlug(slug: string): Promise<EcosystemApp> {
    const app = await this.repo.findBySlug(slug);
    if (!app) throw new AppNotFoundError(slug);
    return app;
  }

  async getAppsByCategory(category: AppCategory): Promise<EcosystemApp[]> {
    return this.repo.findByCategory(category);
  }

  async countApps(): Promise<number> {
    return this.repo.count();
  }

  // ── Search ───────────────────────────────────────────────────────────────────

  async searchApps(q: string): Promise<EcosystemApp[]> {
    if (!q.trim()) return this.repo.findAll();
    const lower = q.toLowerCase();
    const all   = await this.repo.findAll();
    return all.filter(
      a =>
        a.name.toLowerCase().includes(lower) ||
        a.slug.toLowerCase().includes(lower) ||
        (a.description?.toLowerCase().includes(lower) ?? false),
    );
  }

  // ── Register ─────────────────────────────────────────────────────────────────

  async registerApp(input: RegisterAppRequest): Promise<EcosystemApp> {
    validateRegisterRequest(input);

    const exists = await this.repo.existsBySlug(input.slug);
    if (exists) throw new SlugAlreadyExistsError(input.slug);

    const now = new Date().toISOString();
    const app = await this.repo.create({
      ...input,
      status:    input.status ?? "ACTIVE",
      id:        crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });

    this.emitActivity(app);
    return app;
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  async updateApp(id: string, input: UpdateAppRequest): Promise<EcosystemApp> {
    validateUpdateRequest(input);

    const existing = await this.repo.findById(id);
    if (!existing) throw new AppNotFoundError(id);

    const updated = await this.repo.update({ ...existing, ...input });
    if (!updated) throw new AppNotFoundError(id);
    return updated;
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async deleteApp(id: string): Promise<boolean> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new AppNotFoundError(id);
    return this.repo.delete(id);
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  async getStats(): Promise<AppRegistryStats> {
    const all = await this.repo.findAll();
    const categories: Record<string, number> = {};
    for (const cat of APP_CATEGORIES) {
      const n = all.filter(a => a.category === cat).length;
      if (n > 0) categories[cat] = n;
    }
    return {
      totalApps:       all.length,
      activeApps:      all.filter(a => a.status === "ACTIVE").length,
      maintenanceApps: all.filter(a => a.status === "MAINTENANCE").length,
      inactiveApps:    all.filter(a => a.status === "INACTIVE").length,
      categories,
    };
  }

  // ── Activity feed ─────────────────────────────────────────────────────────────

  private emitActivity(app: EcosystemApp): void {
    this.activities.push({
      id:          crypto.randomUUID(),
      type:        "SYSTEM",
      title:       "New Ecosystem App",
      description: `${app.name} đã tham gia Universe ecosystem`,
      visibility:  "PUBLIC",
      sourceApp:   "universe-hub",
      createdAt:   new Date().toISOString(),
    });
  }

  getActivities(): AppRegistryActivity[] {
    return [...this.activities];
  }
}
