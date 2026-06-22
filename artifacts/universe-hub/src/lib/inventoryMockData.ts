// ─── Shared ──────────────────────────────────────────────────────────────────

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const RARITY_META: Record<Rarity, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: "Phổ thông",  color: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/25",   glow: "" },
  uncommon:  { label: "Không phổ", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25", glow: "shadow-[0_0_16px_rgba(52,211,153,0.15)]" },
  rare:      { label: "Hiếm",      color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/25",    glow: "shadow-[0_0_16px_rgba(96,165,250,0.15)]" },
  epic:      { label: "Sử thi",    color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/25",  glow: "shadow-[0_0_16px_rgba(192,132,252,0.18)]" },
  legendary: { label: "Huyền thoại", color: "text-amber-400", bg: "bg-amber-400/10",   border: "border-amber-400/25",   glow: "shadow-[0_0_20px_rgba(251,191,36,0.22)]" },
};

// ─── Pets ────────────────────────────────────────────────────────────────────

export type PetElement = "fire" | "water" | "earth" | "air" | "lightning" | "dark" | "light";
export type PetStatus  = "active" | "resting" | "training" | "battle";

export interface Pet {
  id: string;
  name: string;
  species: string;
  element: PetElement;
  rarity: Rarity;
  level: number;
  maxLevel: number;
  power: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  status: PetStatus;
  acquiredAt: string;
  icon: string;
  description: string;
}

export const ELEMENT_META: Record<PetElement, { label: string; color: string; bg: string }> = {
  fire:      { label: "Lửa",      color: "text-orange-400",  bg: "bg-orange-400/15" },
  water:     { label: "Nước",     color: "text-blue-400",    bg: "bg-blue-400/15" },
  earth:     { label: "Đất",      color: "text-amber-600",   bg: "bg-amber-600/15" },
  air:       { label: "Gió",      color: "text-cyan-300",    bg: "bg-cyan-300/15" },
  lightning: { label: "Sấm",      color: "text-yellow-400",  bg: "bg-yellow-400/15" },
  dark:      { label: "Bóng tối", color: "text-purple-400",  bg: "bg-purple-400/15" },
  light:     { label: "Ánh sáng", color: "text-yellow-200",  bg: "bg-yellow-200/15" },
};

export const PET_STATUS_META: Record<PetStatus, { label: string; color: string; dot: string }> = {
  active:   { label: "Hoạt động",   color: "text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
  resting:  { label: "Nghỉ ngơi",   color: "text-blue-400",    dot: "bg-blue-400" },
  training: { label: "Huấn luyện",  color: "text-amber-400",   dot: "bg-amber-400 animate-pulse" },
  battle:   { label: "Chiến đấu",   color: "text-red-400",     dot: "bg-red-400 animate-pulse" },
};

export const PETS: Pet[] = [
  { id: "PET-001", name: "Infernox",    species: "Rồng lửa",     element: "fire",      rarity: "legendary", level: 85, maxLevel: 100, power: 9240, hp: 8800, attack: 920, defense: 680, speed: 790, status: "active",   acquiredAt: "15/01/2026", icon: "🐉", description: "Rồng huyền thoại từ núi lửa cổ đại, sức mạnh thiêu đốt mọi thứ." },
  { id: "PET-002", name: "Aqua Belle",  species: "Tiên cá",      element: "water",     rarity: "epic",      level: 72, maxLevel: 100, power: 7100, hp: 7200, attack: 710, defense: 750, speed: 850, status: "resting",  acquiredAt: "03/02/2026", icon: "🧜", description: "Tiên cá sử thi từ đại dương sâu thẳm, có thể kiểm soát sóng biển." },
  { id: "PET-003", name: "Voltrix",     species: "Sói sấm",      element: "lightning", rarity: "epic",      level: 68, maxLevel: 100, power: 6850, hp: 6500, attack: 830, defense: 600, speed: 920, status: "training", acquiredAt: "20/02/2026", icon: "⚡🐺", description: "Sói huyền bí mang trong mình sức mạnh của sét." },
  { id: "PET-004", name: "Sylphina",    species: "Nữ thần gió",  element: "air",       rarity: "rare",      level: 55, maxLevel: 80,  power: 5200, hp: 5500, attack: 620, defense: 540, speed: 980, status: "active",   acquiredAt: "08/03/2026", icon: "🌪️", description: "Thần gió nhỏ bé nhưng cực kỳ nhanh nhẹn." },
  { id: "PET-005", name: "Gaia Stone",  species: "Rùa đất",      element: "earth",     rarity: "rare",      level: 48, maxLevel: 80,  power: 4800, hp: 9200, attack: 420, defense: 980, speed: 280, status: "resting",  acquiredAt: "22/03/2026", icon: "🐢", description: "Rùa cổ đại với lớp mai vô cùng cứng chắc." },
  { id: "PET-006", name: "Luminos",     species: "Phượng hoàng", element: "light",     rarity: "legendary", level: 90, maxLevel: 100, power: 9800, hp: 8200, attack: 880, defense: 720, speed: 860, status: "battle",   acquiredAt: "01/01/2026", icon: "🦅", description: "Phượng hoàng ánh sáng, biểu tượng của sự hồi sinh và hy vọng." },
  { id: "PET-007", name: "Shadowfang",  species: "Mèo bóng đêm", element: "dark",      rarity: "epic",      level: 60, maxLevel: 100, power: 6400, hp: 6000, attack: 780, defense: 620, speed: 900, status: "active",   acquiredAt: "14/04/2026", icon: "🐱", description: "Mèo ma thuật ẩn trong bóng tối, kẻ thù không bao giờ nhìn thấy nó." },
  { id: "PET-008", name: "Crystaline",  species: "Bướm pha lê",  element: "light",     rarity: "uncommon",  level: 32, maxLevel: 60,  power: 2900, hp: 3200, attack: 310, defense: 380, speed: 720, status: "resting",  acquiredAt: "10/05/2026", icon: "🦋", description: "Bướm được tạo từ pha lê thuần khiết, tỏa sáng trong đêm tối." },
  { id: "PET-009", name: "Mudkins",     species: "Ếch đất",      element: "earth",     rarity: "common",    level: 15, maxLevel: 50,  power: 1200, hp: 2100, attack: 180, defense: 290, speed: 320, status: "training", acquiredAt: "01/06/2026", icon: "🐸", description: "Ếch đơn giản nhưng trung thành, bắt đầu hành trình của bạn." },
  { id: "PET-010", name: "Pyrex",       species: "Cáo lửa",      element: "fire",      rarity: "uncommon",  level: 38, maxLevel: 60,  power: 3400, hp: 3600, attack: 420, defense: 340, speed: 680, status: "active",   acquiredAt: "18/05/2026", icon: "🦊", description: "Cáo nhỏ nhưng nhanh nhẹn, chuyên tấn công bằng lửa nhỏ." },
  { id: "PET-011", name: "Tideborn",    species: "Cá kiếm",      element: "water",     rarity: "rare",      level: 50, maxLevel: 80,  power: 4600, hp: 5800, attack: 560, defense: 490, speed: 740, status: "active",   acquiredAt: "05/04/2026", icon: "🐋", description: "Cá kiếm khổng lồ từ vùng biển sâu, mạnh mẽ và nguy hiểm." },
  { id: "PET-012", name: "Stormclaw",   species: "Đại bàng sét", element: "lightning", rarity: "rare",      level: 58, maxLevel: 80,  power: 5600, hp: 5200, attack: 720, defense: 520, speed: 880, status: "battle",   acquiredAt: "12/03/2026", icon: "🦅", description: "Đại bàng mang theo luồng sét, vua bầu trời." },
];

// ─── Football Players ─────────────────────────────────────────────────────────

export type Position = "GK" | "CB" | "LB" | "RB" | "CDM" | "CM" | "CAM" | "LW" | "RW" | "ST";

export interface PlayerStats {
  pace: number; shooting: number; passing: number;
  dribbling: number; defending: number; physical: number;
}

export interface FootballPlayer {
  id: string;
  name: string;
  position: Position;
  team: string;
  nationality: string;
  flag: string;
  rarity: Rarity;
  rating: number;
  level: number;
  stats: PlayerStats;
  value: number;
  acquiredAt: string;
  icon: string;
  specialAbility: string;
}

export const POSITION_META: Record<Position, { color: string; bg: string }> = {
  GK:  { color: "text-yellow-400",  bg: "bg-yellow-400/15" },
  CB:  { color: "text-blue-400",    bg: "bg-blue-400/15" },
  LB:  { color: "text-blue-300",    bg: "bg-blue-300/15" },
  RB:  { color: "text-blue-300",    bg: "bg-blue-300/15" },
  CDM: { color: "text-green-400",   bg: "bg-green-400/15" },
  CM:  { color: "text-green-300",   bg: "bg-green-300/15" },
  CAM: { color: "text-orange-400",  bg: "bg-orange-400/15" },
  LW:  { color: "text-red-400",     bg: "bg-red-400/15" },
  RW:  { color: "text-red-400",     bg: "bg-red-400/15" },
  ST:  { color: "text-red-500",     bg: "bg-red-500/15" },
};

export const FOOTBALL_PLAYERS: FootballPlayer[] = [
  { id: "FP-001", name: "Ronaldo Silva",   position: "ST",  team: "Football Universe FC", nationality: "Brazil",      flag: "🇧🇷", rarity: "legendary", rating: 99, level: 10, stats: { pace: 94, shooting: 99, passing: 82, dribbling: 96, defending: 38, physical: 89 }, value: 280000, acquiredAt: "10/01/2026", icon: "⚽", specialAbility: "Hattrick King" },
  { id: "FP-002", name: "Kai Müller",      position: "CM",  team: "Galactic United",      nationality: "Đức",         flag: "🇩🇪", rarity: "legendary", rating: 97, level: 10, stats: { pace: 78, shooting: 82, passing: 98, dribbling: 91, defending: 75, physical: 82 }, value: 195000, acquiredAt: "15/01/2026", icon: "⚽", specialAbility: "Vision Master" },
  { id: "FP-003", name: "Luis Vargas",     position: "GK",  team: "Star Phoenix",         nationality: "Argentina",   flag: "🇦🇷", rarity: "epic",      rating: 94, level: 8,  stats: { pace: 62, shooting: 15, passing: 72, dribbling: 55, defending: 96, physical: 88 }, value: 120000, acquiredAt: "22/01/2026", icon: "🧤", specialAbility: "Iron Wall" },
  { id: "FP-004", name: "Yuki Tanaka",     position: "LW",  team: "Galaxy Strikers",      nationality: "Nhật Bản",    flag: "🇯🇵", rarity: "epic",      rating: 92, level: 7,  stats: { pace: 98, shooting: 87, passing: 80, dribbling: 95, defending: 42, physical: 68 }, value: 98000,  acquiredAt: "05/02/2026", icon: "⚽", specialAbility: "Lightning Speed" },
  { id: "FP-005", name: "Marco De Rossi",  position: "CB",  team: "Cosmos Defenders",     nationality: "Ý",           flag: "🇮🇹", rarity: "epic",      rating: 91, level: 7,  stats: { pace: 72, shooting: 42, passing: 78, dribbling: 68, defending: 96, physical: 92 }, value: 88000,  acquiredAt: "18/02/2026", icon: "🛡️", specialAbility: "Tactical Block" },
  { id: "FP-006", name: "Adama Diallo",    position: "CDM", team: "Orbital Warriors",     nationality: "Pháp",        flag: "🇫🇷", rarity: "rare",      rating: 87, level: 5,  stats: { pace: 82, shooting: 64, passing: 80, dribbling: 78, defending: 90, physical: 94 }, value: 52000,  acquiredAt: "03/03/2026", icon: "⚽", specialAbility: "Intercept Pro" },
  { id: "FP-007", name: "Park Joon-Ho",    position: "RW",  team: "Nova FC",              nationality: "Hàn Quốc",    flag: "🇰🇷", rarity: "rare",      rating: 85, level: 5,  stats: { pace: 96, shooting: 78, passing: 72, dribbling: 90, defending: 38, physical: 72 }, value: 46000,  acquiredAt: "12/03/2026", icon: "⚽", specialAbility: "Cross Specialist" },
  { id: "FP-008", name: "Tom Harrison",    position: "RB",  team: "Universe City FC",     nationality: "Anh",         flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rarity: "rare",      rating: 83, level: 4,  stats: { pace: 88, shooting: 58, passing: 80, dribbling: 75, defending: 84, physical: 80 }, value: 38000,  acquiredAt: "25/03/2026", icon: "⚽", specialAbility: "Overlap Run" },
  { id: "FP-009", name: "Carlos Mendez",   position: "ST",  team: "Planet Rovers",        nationality: "Colombia",    flag: "🇨🇴", rarity: "uncommon",  rating: 78, level: 3,  stats: { pace: 85, shooting: 80, passing: 62, dribbling: 82, defending: 30, physical: 76 }, value: 18000,  acquiredAt: "10/04/2026", icon: "⚽", specialAbility: "Poacher" },
  { id: "FP-010", name: "Ali Hassan",      position: "CAM", team: "Desert Storm FC",      nationality: "Ai Cập",      flag: "🇪🇬", rarity: "uncommon",  rating: 76, level: 2,  stats: { pace: 74, shooting: 72, passing: 82, dribbling: 85, defending: 38, physical: 64 }, value: 14000,  acquiredAt: "20/04/2026", icon: "⚽", specialAbility: "Free Kick Expert" },
  { id: "FP-011", name: "Ivan Petrov",     position: "LB",  team: "Crimson Stars",        nationality: "Nga",         flag: "🇷🇺", rarity: "common",    rating: 71, level: 1,  stats: { pace: 78, shooting: 42, passing: 72, dribbling: 68, defending: 76, physical: 84 }, value: 6000,   acquiredAt: "01/05/2026", icon: "⚽", specialAbility: "Solid Defense" },
  { id: "FP-012", name: "Nguyen Van A",    position: "CM",  team: "Dragon United",        nationality: "Việt Nam",    flag: "🇻🇳", rarity: "common",    rating: 68, level: 1,  stats: { pace: 72, shooting: 60, passing: 74, dribbling: 70, defending: 58, physical: 70 }, value: 4500,   acquiredAt: "10/05/2026", icon: "⚽", specialAbility: "Endurance Run" },
];

// ─── World Assets ─────────────────────────────────────────────────────────────

export type AssetType   = "land" | "building" | "monument" | "portal" | "resource";
export type AssetStatus = "owned" | "renting" | "developing" | "idle";

export interface WorldAsset {
  id: string;
  name: string;
  type: AssetType;
  world: string;
  coordinates: string;
  size: number;
  value: number;
  rarity: Rarity;
  status: AssetStatus;
  acquiredAt: string;
  icon: string;
  description: string;
  income: number;
}

export const ASSET_TYPE_META: Record<AssetType, { label: string; color: string; icon: string }> = {
  land:      { label: "Đất",          color: "text-amber-600", icon: "🏔️" },
  building:  { label: "Công trình",   color: "text-blue-400",  icon: "🏛️" },
  monument:  { label: "Di tích",      color: "text-purple-400",icon: "🗿" },
  portal:    { label: "Cổng không gian",color: "text-cyan-400",icon: "🌀" },
  resource:  { label: "Mỏ tài nguyên",color: "text-emerald-400",icon: "💎" },
};

export const ASSET_STATUS_META: Record<AssetStatus, { label: string; color: string; bg: string }> = {
  owned:      { label: "Sở hữu",       color: "text-emerald-400", bg: "bg-emerald-400/10" },
  renting:    { label: "Cho thuê",     color: "text-blue-400",    bg: "bg-blue-400/10" },
  developing: { label: "Đang xây dựng",color: "text-amber-400",   bg: "bg-amber-400/10" },
  idle:       { label: "Bỏ trống",     color: "text-gray-400",    bg: "bg-gray-400/10" },
};

export const WORLD_ASSETS: WorldAsset[] = [
  { id: "WA-001", name: "Tháp Ngân Hà",        type: "building",  world: "World Creator Alpha",   coordinates: "X:420, Y:880", size: 2400, value: 850000, rarity: "legendary", status: "renting",    acquiredAt: "10/01/2026", icon: "🗼", description: "Tòa tháp cao nhất trong vũ trụ, nhìn thấy từ mọi thế giới.", income: 12000 },
  { id: "WA-002", name: "Mỏ Kim Cương Alpha",  type: "resource",  world: "World Creator Alpha",   coordinates: "X:150, Y:320", size: 800,  value: 620000, rarity: "legendary", status: "owned",      acquiredAt: "15/01/2026", icon: "💎", description: "Mỏ kim cương lớn nhất, nguồn tài nguyên quý hiếm vô tận.", income: 8500 },
  { id: "WA-003", name: "Cổng Chiều Không Gian",type: "portal",    world: "Universe Map",          coordinates: "X:0, Y:0",     size: 500,  value: 520000, rarity: "epic",      status: "owned",      acquiredAt: "22/01/2026", icon: "🌀", description: "Cổng kết nối các thế giới, tạo điều kiện du hành tức thì.", income: 6200 },
  { id: "WA-004", name: "Đảo Rồng",            type: "land",      world: "Animal Evolution",      coordinates: "X:780, Y:240", size: 5600, value: 380000, rarity: "epic",      status: "developing", acquiredAt: "05/02/2026", icon: "🏝️", description: "Hòn đảo huyền bí nơi những con rồng cổ đại sinh sống.", income: 0 },
  { id: "WA-005", name: "Sân Vận Động Vũ Trụ", type: "building",  world: "Football Universe",     coordinates: "X:300, Y:600", size: 8000, value: 320000, rarity: "epic",      status: "renting",    acquiredAt: "18/02/2026", icon: "🏟️", description: "Sân vận động lớn nhất, chứa 500,000 khán giả toàn vũ trụ.", income: 4800 },
  { id: "WA-006", name: "Đền Cổ Đại Luminos",  type: "monument",  world: "World Creator Beta",    coordinates: "X:550, Y:120", size: 1200, value: 240000, rarity: "rare",      status: "owned",      acquiredAt: "03/03/2026", icon: "🏛️", description: "Đền thờ 1000 năm tuổi với phép thuật cổ đại bảo vệ.", income: 2200 },
  { id: "WA-007", name: "Đồng Bằng Tinh Khiết",type: "land",      world: "Animal Evolution",      coordinates: "X:920, Y:750", size: 3200, value: 145000, rarity: "rare",      status: "idle",       acquiredAt: "20/03/2026", icon: "🌾", description: "Đồng bằng phì nhiêu với nguồn nước trong lành từ tự nhiên.", income: 0 },
  { id: "WA-008", name: "Mỏ Năng Lượng Mặt Trời",type:"resource", world: "Football Universe",     coordinates: "X:100, Y:800", size: 600,  value: 92000,  rarity: "uncommon",  status: "owned",      acquiredAt: "10/04/2026", icon: "☀️", description: "Nguồn năng lượng sạch từ mặt trời, cung cấp điện cho khu vực.", income: 1100 },
  { id: "WA-009", name: "Khu Đất Trống 7",     type: "land",      world: "World Creator Alpha",   coordinates: "X:200, Y:450", size: 900,  value: 35000,  rarity: "common",    status: "idle",       acquiredAt: "01/05/2026", icon: "🏕️", description: "Khu đất bằng phẳng chưa được khai thác, tiềm năng lớn.", income: 0 },
];

// ─── Tickets ──────────────────────────────────────────────────────────────────

export type TicketType   = "match" | "concert" | "tournament" | "vip" | "festival";
export type TicketStatus = "valid" | "used" | "expired";

export interface Ticket {
  id: string;
  name: string;
  event: string;
  type: TicketType;
  date: string;
  time: string;
  venue: string;
  price: number;
  rarity: Rarity;
  status: TicketStatus;
  icon: string;
  perks: string[];
  seatInfo: string;
}

export const TICKET_TYPE_META: Record<TicketType, { label: string; color: string; bg: string; border: string }> = {
  match:      { label: "Trận đấu",   color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  concert:    { label: "Hòa nhạc",   color: "text-pink-400",    bg: "bg-pink-400/10",    border: "border-pink-400/20" },
  tournament: { label: "Giải đấu",   color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  vip:        { label: "VIP",        color: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20" },
  festival:   { label: "Lễ hội",     color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20" },
};

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; color: string; bg: string; border: string }> = {
  valid:   { label: "Hợp lệ",     color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  used:    { label: "Đã sử dụng", color: "text-gray-400",    bg: "bg-gray-400/10",    border: "border-gray-400/20" },
  expired: { label: "Hết hạn",   color: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20" },
};

export const TICKETS: Ticket[] = [
  { id: "TK-001", name: "Chung Kết Football Universe",   event: "Football Universe World Cup Final", type: "vip",        date: "28/06/2026", time: "20:00", venue: "Sân VĐ Vũ Trụ", price: 85000, rarity: "legendary", status: "valid",   icon: "🏆", perks: ["Phòng VIP", "Gặp gỡ cầu thủ", "Quà lưu niệm", "Bữa tối sang trọng"], seatInfo: "VIP Box A-01" },
  { id: "TK-002", name: "Galaxy Music Festival",          event: "Galaxy Music Fest 2026",            type: "festival",   date: "15/07/2026", time: "18:00", venue: "Quảng Trường Ngân Hà", price: 42000, rarity: "epic", status: "valid",   icon: "🎵", perks: ["Khu VIP", "Backstage pass", "Poster signed"], seatInfo: "Festival Zone B" },
  { id: "TK-003", name: "Giải Đấu Thú Cưng Mùa Hè",    event: "Pet Battle Championship S3",        type: "tournament", date: "10/07/2026", time: "14:00", venue: "Đấu Trường Thú Cưng", price: 28000, rarity: "epic", status: "valid",   icon: "⚔️", perks: ["Ghế đầu sân", "Bình luận trực tiếp", "Voucher 5000CR"], seatInfo: "Ring Side R-12" },
  { id: "TK-004", name: "Bán Kết Cúp Thế Giới",         event: "World Cup 2026 Semi-Final",         type: "match",      date: "22/06/2026", time: "21:00", venue: "Sân VĐ Vũ Trụ", price: 35000, rarity: "rare", status: "valid",   icon: "⚽", perks: ["Ghế khán đài A", "Bữa nhẹ miễn phí"], seatInfo: "Stand A - Row 5, Seat 28" },
  { id: "TK-005", name: "Hòa Nhạc Ánh Sao",             event: "StarLight Orchestra Night",         type: "concert",    date: "05/06/2026", time: "19:30", venue: "Nhà Hát Vũ Trụ", price: 18000,  rarity: "rare", status: "used",    icon: "🎻", perks: ["Chỗ ngồi hạng nhất"], seatInfo: "Premium - Row 3, Seat 14" },
  { id: "TK-006", name: "Tứ Kết World Cup",             event: "World Cup 2026 Quarter-Final",      type: "match",      date: "18/06/2026", time: "17:00", venue: "Sân VĐ Vũ Trụ", price: 22000, rarity: "uncommon", status: "used", icon: "⚽", perks: ["Ghế thường"], seatInfo: "Stand C - Row 12, Seat 45" },
  { id: "TK-007", name: "Lễ Hội Mùa Xuân Vũ Trụ",      event: "Universe Spring Festival",          type: "festival",   date: "20/03/2026", time: "10:00", venue: "Công Viên Vũ Trụ", price: 8000,  rarity: "common", status: "used",    icon: "🌸", perks: ["Vào cửa tự do"], seatInfo: "Open Area" },
  { id: "TK-008", name: "Giải Đấu Khu Vực Phía Đông",  event: "Eastern Region Football League",    type: "tournament", date: "12/04/2026", time: "15:00", venue: "Sân Địa Phương", price: 5000,   rarity: "common", status: "expired", icon: "🏅", perks: ["Ghế thường"], seatInfo: "Stand B - General" },
];

// ─── Items ────────────────────────────────────────────────────────────────────

export type ItemCategory = "equipment" | "consumable" | "material" | "decoration" | "special";

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: Rarity;
  quantity: number;
  power: number;
  value: number;
  description: string;
  icon: string;
  usableIn: string[];
  effect?: string;
}

export const ITEM_CATEGORY_META: Record<ItemCategory, { label: string; color: string; bg: string; border: string }> = {
  equipment:  { label: "Trang bị",    color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20" },
  consumable: { label: "Tiêu hao",    color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20" },
  material:   { label: "Nguyên liệu", color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20" },
  decoration: { label: "Trang trí",   color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20" },
  special:    { label: "Đặc biệt",    color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
};

export const ITEMS: InventoryItem[] = [
  { id: "IT-001", name: "Kiếm Ngân Hà",         category: "equipment",  rarity: "legendary", quantity: 1,   power: 9500, value: 450000, description: "Kiếm huyền thoại đúc từ thiên thạch ngàn năm tuổi.", icon: "⚔️", usableIn: ["Pet Battle", "World Creator"], effect: "+95% Sát thương" },
  { id: "IT-002", name: "Giáp Rồng Đen",        category: "equipment",  rarity: "legendary", quantity: 1,   power: 8800, value: 380000, description: "Giáp làm từ vảy rồng đen huyền bí, bất khả xâm phạm.", icon: "🛡️", usableIn: ["Pet Battle"], effect: "+88% Phòng thủ" },
  { id: "IT-003", name: "Tinh Thạch Huyền Bí",  category: "material",   rarity: "epic",      quantity: 12,  power: 0,    value: 85000,  description: "Nguyên liệu quý hiếm để chế tạo vũ khí cấp cao.", icon: "💠", usableIn: ["Crafting"], effect: "Nguyên liệu chế tạo" },
  { id: "IT-004", name: "Thuốc Tăng Sức Mạnh",  category: "consumable", rarity: "epic",      quantity: 5,   power: 0,    value: 28000,  description: "Tăng sức mạnh tạm thời cho thú cưng trong 24h.", icon: "⚗️", usableIn: ["Pet Battle"], effect: "+50% Sức mạnh (24h)" },
  { id: "IT-005", name: "Cờ Hiệu Đội Tuyển",    category: "decoration", rarity: "epic",      quantity: 3,   power: 0,    value: 42000,  description: "Cờ của Football Universe FC, biểu tượng danh dự.", icon: "🚩", usableIn: ["World Creator", "Football Universe"], effect: "+5% Tinh thần đội" },
  { id: "IT-006", name: "Bản Đồ Kho Báu",       category: "special",    rarity: "rare",      quantity: 2,   power: 0,    value: 65000,  description: "Bản đồ dẫn đến kho báu ẩn trong World Creator.", icon: "🗺️", usableIn: ["World Creator"], effect: "Mở khóa khu vực ẩn" },
  { id: "IT-007", name: "Trái Tim Tinh Thể",    category: "material",   rarity: "rare",      quantity: 8,   power: 0,    value: 18000,  description: "Trái tim tinh thể thu nhập từ các thú cưng huyền thoại.", icon: "💎", usableIn: ["Crafting", "Pet Upgrade"], effect: "Nâng cấp thú cưng" },
  { id: "IT-008", name: "Giày Tốc Độ Sấm",      category: "equipment",  rarity: "rare",      quantity: 1,   power: 4200, value: 55000,  description: "Giày ma thuật tăng tốc độ di chuyển tối đa.", icon: "👟", usableIn: ["Football Universe", "Pet Battle"], effect: "+42% Tốc độ" },
  { id: "IT-009", name: "Nước Phục Hồi Cấp S",  category: "consumable", rarity: "rare",      quantity: 20,  power: 0,    value: 8500,   description: "Phục hồi toàn bộ HP của thú cưng ngay lập tức.", icon: "🧪", usableIn: ["Pet Battle"], effect: "Hồi 100% HP" },
  { id: "IT-010", name: "Đèn Lồng Vũ Trụ",      category: "decoration", rarity: "uncommon",  quantity: 6,   power: 0,    value: 12000,  description: "Đèn lồng phát sáng đẹp mắt để trang trí tài sản.", icon: "🏮", usableIn: ["World Creator"], effect: "+Vẻ đẹp công trình" },
  { id: "IT-011", name: "Quặng Sắt Tinh",       category: "material",   rarity: "uncommon",  quantity: 45,  power: 0,    value: 2200,   description: "Quặng sắt chất lượng cao dùng để chế tạo trang bị.", icon: "⛏️", usableIn: ["Crafting"], effect: "Nguyên liệu cơ bản" },
  { id: "IT-012", name: "Thuốc Mana Nhỏ",       category: "consumable", rarity: "common",    quantity: 88,  power: 0,    value: 350,    description: "Phục hồi một lượng nhỏ mana khi cần thiết.", icon: "🔵", usableIn: ["Pet Battle", "World Creator"], effect: "Hồi 25% Mana" },
  { id: "IT-013", name: "Hạt Giống Ma Thuật",   category: "material",   rarity: "common",    quantity: 120, power: 0,    value: 180,    description: "Hạt giống có thể trồng trong World Creator.", icon: "🌱", usableIn: ["World Creator"], effect: "Trồng cây đặc biệt" },
  { id: "IT-014", name: "Vé Xổ Số Vũ Trụ",     category: "special",    rarity: "uncommon",  quantity: 3,   power: 0,    value: 5000,   description: "Vé xổ số có cơ hội trúng vật phẩm huyền thoại.", icon: "🎫", usableIn: ["Lottery"], effect: "Cơ hội nhận quà" },
];

// ─── Inventory Analytics ──────────────────────────────────────────────────────

export const INVENTORY_STATS = {
  totalItems:    PETS.length + FOOTBALL_PLAYERS.length + WORLD_ASSETS.length + TICKETS.length + ITEMS.length,
  totalValue:    PETS.reduce((s, _) => s + 15000, 0)
               + FOOTBALL_PLAYERS.reduce((s, p) => s + p.value, 0)
               + WORLD_ASSETS.reduce((s, a) => s + a.value, 0)
               + TICKETS.reduce((s, t) => s + t.price, 0)
               + ITEMS.reduce((s, i) => s + i.value * i.quantity, 0),
  legendaryCount: [
    ...PETS, ...FOOTBALL_PLAYERS, ...WORLD_ASSETS, ...TICKETS, ...ITEMS
  ].filter(x => x.rarity === "legendary").length,
  weeklyIncome:  WORLD_ASSETS.reduce((s, a) => s + a.income, 0),
};

export const INVENTORY_VALUE_TREND = [
  { label: "T1", value: 1200000 },
  { label: "T2", value: 1480000 },
  { label: "T3", value: 1650000 },
  { label: "T4", value: 1820000 },
  { label: "T5", value: 2100000 },
  { label: "T6", value: 2380000 },
];

export const CATEGORY_BREAKDOWN = [
  { name: "Thú cưng",     count: PETS.length,             value: 680000,  color: "#c084fc" },
  { name: "Cầu thủ",     count: FOOTBALL_PLAYERS.length, value: 960000,  color: "#60a5fa" },
  { name: "Tài sản TG",  count: WORLD_ASSETS.length,     value: 3204000, color: "#34d399" },
  { name: "Vé",          count: TICKETS.length,           value: 243000,  color: "#fbbf24" },
  { name: "Vật phẩm",   count: ITEMS.length,             value: 420000,  color: "#f87171" },
];

export const RARITY_BREAKDOWN = [
  { name: "Huyền thoại", count: 6,  color: "#fbbf24" },
  { name: "Sử thi",      count: 12, color: "#c084fc" },
  { name: "Hiếm",        count: 18, color: "#60a5fa" },
  { name: "Không phổ",  count: 14, color: "#34d399" },
  { name: "Phổ thông",  count: 10, color: "#9ca3af" },
];
