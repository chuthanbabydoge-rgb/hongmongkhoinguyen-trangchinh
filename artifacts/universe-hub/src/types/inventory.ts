// ─── Category ─────────────────────────────────────────────────────────────────

export type InventoryCategory =
  | "pets"
  | "football"
  | "world-assets"
  | "tickets"
  | "items";

export const CATEGORY_META: Record<
  InventoryCategory,
  { label: string; icon: string; color: string }
> = {
  pets:            { label: "Thú cưng",          icon: "🐾", color: "text-purple-400" },
  football:        { label: "Cầu thủ bóng đá",   icon: "⚽", color: "text-blue-400" },
  "world-assets":  { label: "Tài sản thế giới",  icon: "🌍", color: "text-emerald-400" },
  tickets:         { label: "Vé",                icon: "🎫", color: "text-amber-400" },
  items:           { label: "Vật phẩm",          icon: "🎒", color: "text-red-400" },
};

// ─── Rarity ───────────────────────────────────────────────────────────────────

export type Rarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export const RARITY_META: Record<
  Rarity,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    order: number;
  }
> = {
  common:    { label: "Thông thường", color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/25",   glow: "",                                                order: 1 },
  rare:      { label: "Hiếm",        color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/25",   glow: "shadow-[0_0_16px_rgba(96,165,250,0.18)]",         order: 2 },
  epic:      { label: "Sử thi",      color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/25", glow: "shadow-[0_0_16px_rgba(192,132,252,0.22)]",        order: 3 },
  legendary: { label: "Huyền thoại", color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/25",  glow: "shadow-[0_0_20px_rgba(251,191,36,0.26)]",         order: 4 },
  mythic:    { label: "Thần thoại",  color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/25",   glow: "shadow-[0_0_28px_rgba(251,113,133,0.35)]",        order: 5 },
};

// ─── Status ───────────────────────────────────────────────────────────────────

export type ItemStatus =
  | "active"
  | "inactive"
  | "locked"
  | "trading"
  | "equipped"
  | "used"
  | "expired";

export const STATUS_META: Record<
  ItemStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  active:   { label: "Hoạt động",   color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400 animate-pulse" },
  inactive: { label: "Không hoạt động", color: "text-gray-400",    bg: "bg-gray-400/10",    dot: "bg-gray-400" },
  locked:   { label: "Khóa",        color: "text-red-400",     bg: "bg-red-400/10",     dot: "bg-red-400" },
  trading:  { label: "Đang giao dịch", color: "text-amber-400",  bg: "bg-amber-400/10",  dot: "bg-amber-400 animate-pulse" },
  equipped: { label: "Đang trang bị", color: "text-blue-400",   bg: "bg-blue-400/10",   dot: "bg-blue-400" },
  used:     { label: "Đã sử dụng",  color: "text-slate-400",   bg: "bg-slate-400/10",   dot: "bg-slate-400" },
  expired:  { label: "Hết hạn",    color: "text-red-500",     bg: "bg-red-500/10",     dot: "bg-red-500" },
};

// ─── Base inventory item ──────────────────────────────────────────────────────

/**
 * All inventory items across every category share this common schema.
 * Category-specific interfaces extend this base.
 */
export interface BaseInventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  rarity: Rarity;
  quantity: number;
  value: number;
  status: ItemStatus;
  image: string;
  createdAt: string;
}

// ─── Pet ──────────────────────────────────────────────────────────────────────

export type PetElement =
  | "fire" | "water" | "earth" | "air"
  | "lightning" | "dark" | "light" | "ice" | "poison";

export type PetStatus = "active" | "resting" | "training" | "battle";

export interface Pet extends BaseInventoryItem {
  category: "pets";
  species: string;
  element: PetElement;
  level: number;
  maxLevel: number;
  power: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  petStatus: PetStatus;
  description: string;
}

// ─── Football Player ──────────────────────────────────────────────────────────

export type Position =
  | "GK" | "CB" | "LB" | "RB"
  | "CDM" | "CM" | "CAM"
  | "LW" | "RW" | "ST";

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface FootballPlayer extends BaseInventoryItem {
  category: "football";
  position: Position;
  team: string;
  nationality: string;
  flag: string;
  rating: number;
  level: number;
  stats: PlayerStats;
  specialAbility: string;
}

// ─── World Asset ──────────────────────────────────────────────────────────────

export type AssetType = "land" | "building" | "monument" | "portal" | "resource" | "dungeon";

export type AssetStatus = "owned" | "renting" | "developing" | "idle";

export interface WorldAsset extends BaseInventoryItem {
  category: "world-assets";
  assetType: AssetType;
  world: string;
  coordinates: string;
  size: number;
  assetStatus: AssetStatus;
  income: number;
  description: string;
}

// ─── Ticket ───────────────────────────────────────────────────────────────────

export type TicketType = "match" | "concert" | "tournament" | "vip" | "festival" | "exclusive";

export type TicketValidity = "valid" | "used" | "expired";

export interface Ticket extends BaseInventoryItem {
  category: "tickets";
  ticketType: TicketType;
  event: string;
  date: string;
  time: string;
  venue: string;
  seatInfo: string;
  perks: string[];
  ticketValidity: TicketValidity;
}

// ─── Item ─────────────────────────────────────────────────────────────────────

export type ItemCategory =
  | "equipment" | "consumable" | "material" | "decoration" | "special" | "weapon" | "armor";

export interface InventoryItem extends BaseInventoryItem {
  category: "items";
  itemCategory: ItemCategory;
  power: number;
  effect: string;
  usableIn: string[];
  description: string;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type AnyInventoryItem =
  | Pet
  | FootballPlayer
  | WorldAsset
  | Ticket
  | InventoryItem;

// ─── Metadata helpers ─────────────────────────────────────────────────────────

export const ELEMENT_META: Record<PetElement, { label: string; color: string; bg: string }> = {
  fire:      { label: "Lửa",       color: "text-orange-400", bg: "bg-orange-400/15" },
  water:     { label: "Nước",      color: "text-blue-400",   bg: "bg-blue-400/15" },
  earth:     { label: "Đất",       color: "text-amber-600",  bg: "bg-amber-600/15" },
  air:       { label: "Gió",       color: "text-cyan-300",   bg: "bg-cyan-300/15" },
  lightning: { label: "Sấm sét",   color: "text-yellow-400", bg: "bg-yellow-400/15" },
  dark:      { label: "Bóng tối",  color: "text-purple-400", bg: "bg-purple-400/15" },
  light:     { label: "Ánh sáng",  color: "text-yellow-200", bg: "bg-yellow-200/15" },
  ice:       { label: "Băng",      color: "text-sky-300",    bg: "bg-sky-300/15" },
  poison:    { label: "Độc",       color: "text-green-500",  bg: "bg-green-500/15" },
};

export const PET_STATUS_META: Record<PetStatus, { label: string; color: string; dot: string }> = {
  active:   { label: "Hoạt động",   color: "text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
  resting:  { label: "Nghỉ ngơi",   color: "text-blue-400",    dot: "bg-blue-400" },
  training: { label: "Huấn luyện",  color: "text-amber-400",   dot: "bg-amber-400 animate-pulse" },
  battle:   { label: "Chiến đấu",   color: "text-red-400",     dot: "bg-red-400 animate-pulse" },
};

export const POSITION_META: Record<Position, { color: string; bg: string }> = {
  GK:  { color: "text-yellow-400", bg: "bg-yellow-400/15" },
  CB:  { color: "text-blue-400",   bg: "bg-blue-400/15" },
  LB:  { color: "text-blue-300",   bg: "bg-blue-300/15" },
  RB:  { color: "text-blue-300",   bg: "bg-blue-300/15" },
  CDM: { color: "text-green-400",  bg: "bg-green-400/15" },
  CM:  { color: "text-green-300",  bg: "bg-green-300/15" },
  CAM: { color: "text-orange-400", bg: "bg-orange-400/15" },
  LW:  { color: "text-red-400",    bg: "bg-red-400/15" },
  RW:  { color: "text-red-400",    bg: "bg-red-400/15" },
  ST:  { color: "text-red-500",    bg: "bg-red-500/15" },
};

export const ASSET_TYPE_META: Record<AssetType, { label: string; color: string; icon: string }> = {
  land:     { label: "Đất",             color: "text-amber-600",  icon: "🏔️" },
  building: { label: "Công trình",      color: "text-blue-400",   icon: "🏛️" },
  monument: { label: "Di tích",         color: "text-purple-400", icon: "🗿" },
  portal:   { label: "Cổng không gian", color: "text-cyan-400",   icon: "🌀" },
  resource: { label: "Mỏ tài nguyên",  color: "text-emerald-400",icon: "💎" },
  dungeon:  { label: "Hầm ngục",        color: "text-rose-400",   icon: "🏚️" },
};

export const TICKET_TYPE_META: Record<
  TicketType,
  { label: string; color: string; bg: string; border: string }
> = {
  match:      { label: "Trận đấu",    color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  concert:    { label: "Hòa nhạc",   color: "text-pink-400",    bg: "bg-pink-400/10",    border: "border-pink-400/20" },
  tournament: { label: "Giải đấu",   color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  vip:        { label: "VIP",        color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20" },
  festival:   { label: "Lễ hội",     color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20" },
  exclusive:  { label: "Độc quyền",  color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20" },
};

export const ITEM_CATEGORY_META: Record<
  ItemCategory,
  { label: string; color: string; bg: string; border: string }
> = {
  equipment:  { label: "Trang bị",    color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20" },
  consumable: { label: "Tiêu hao",    color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20" },
  material:   { label: "Nguyên liệu", color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20" },
  decoration: { label: "Trang trí",   color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20" },
  special:    { label: "Đặc biệt",    color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  weapon:     { label: "Vũ khí",      color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20" },
  armor:      { label: "Giáp",        color: "text-slate-400",  bg: "bg-slate-400/10",  border: "border-slate-400/20" },
};
