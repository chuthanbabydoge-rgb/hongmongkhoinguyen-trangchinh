import type {
  Listing as BaseListing,
  Auction as BaseAuction,
  Trade,
  MarketCurrency,
  MarketCategory,
  ListingStatus,
  AuctionStatus,
} from "@/types/marketplace";

// ─── Re-exports for backward compatibility ────────────────────────────────────

export type { ListingStatus, AuctionStatus, MarketCurrency, Trade, TradeStatus } from "@/types/marketplace";
export type ListingCategory = MarketCategory;

// ─── Local types ──────────────────────────────────────────────────────────────

export type MarketRarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type TxType = "purchase" | "sale" | "auction_win" | "auction_sold" | "offer_accepted";

// ─── Rich Listing (extends base + display fields) ─────────────────────────────

export interface Listing extends BaseListing {
  name: string;
  image: string;
  rarity: MarketRarity;
  sellerAvatar: string;
  originalValue: number;
  quantity: number;
  description: string;
  listedAt: string;
  views: number;
  favorites: number;
  tags: string[];
}

// ─── Bid ─────────────────────────────────────────────────────────────────────

export interface Bid {
  bidder: string;
  avatar: string;
  amount: number;
  at: string;
}

// ─── Rich Auction (extends base + display fields) ─────────────────────────────

export interface Auction extends BaseAuction {
  name: string;
  image: string;
  category: ListingCategory;
  rarity: MarketRarity;
  seller: string;
  sellerAvatar: string;
  startPrice: number;
  buyNowPrice: number | null;
  minIncrement: number;
  endTime: string;
  bids: Bid[];
  watchers: number;
  description: string;
  isHot: boolean;
}

// ─── Market Transaction ───────────────────────────────────────────────────────

export interface MarketTransaction {
  id: string;
  itemName: string;
  itemImage: string;
  category: ListingCategory;
  rarity: MarketRarity;
  buyer: string;
  buyerAvatar: string;
  seller: string;
  sellerAvatar: string;
  price: number;
  type: TxType;
  date: string;
  fee: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const now = new Date("2026-06-22T10:00:00Z");
function hoursFromNow(h: number) { return new Date(now.getTime() + h * 3_600_000).toISOString(); }
function daysAgo(d: number) { return new Date(now.getTime() - d * 86_400_000).toISOString(); }

// ─── Listings (30) ───────────────────────────────────────────────────────────

export const LISTINGS: Listing[] = [
  { id: "L-001", itemId: "IT-PET-001", itemName: "Infernox – Rồng lửa Thần thoại", name: "Infernox – Rồng lửa Thần thoại", image: "🐉", category: "pets", rarity: "mythic", seller: "DragonMaster_X", sellerAvatar: "DM", price: 980000, currency: "CR", originalValue: 1200000, quantity: 1, description: "Rồng thần thoại từ lõi núi lửa cổ đại. Đây là cơ hội hiếm có.", listedAt: daysAgo(0.5), createdAt: daysAgo(0.5), views: 4820, favorites: 312, status: "active", tags: ["Hot", "Giảm giá"] },
  { id: "L-002", itemId: "IT-ASSET-001", itemName: "Mỏ Tinh Thể Vũ Trụ", name: "Mỏ Tinh Thể Vũ Trụ", image: "💎", category: "world-assets", rarity: "mythic", seller: "CosmicLord_7", sellerAvatar: "CL", price: 6800000, currency: "CR", originalValue: 7500000, quantity: 1, description: "Mỏ tinh thể lớn nhất galaxy, thu nhập thụ động 62K CR/tuần.", listedAt: daysAgo(1), createdAt: daysAgo(1), views: 3200, favorites: 228, status: "active", tags: ["Thu nhập thụ động", "Hiếm"] },
  { id: "L-003", itemId: "IT-PLAYER-001", itemName: "El Dios – Cầu thủ Thần thoại", name: "El Dios – Cầu thủ Thần thoại", image: "👑", category: "football", rarity: "mythic", seller: "FootballGod", sellerAvatar: "FG", price: 2100000, currency: "CR", originalValue: 2500000, quantity: 1, description: "Rating 100 – cầu thủ tối thượng. God Touch ability.", listedAt: daysAgo(2), createdAt: daysAgo(2), views: 5100, favorites: 445, status: "active", tags: ["Hot", "Rating MAX"] },
  { id: "L-004", itemId: "IT-ITEM-001", itemName: "Kiếm Thần Thoại Vũ Trụ", name: "Kiếm Thần Thoại Vũ Trụ", image: "🗡️", category: "items", rarity: "mythic", seller: "SwordSage_Z", sellerAvatar: "SS", price: 2400000, currency: "CR", originalValue: 2800000, quantity: 1, description: "+120% sát thương toàn cục. Được đúc từ lõi ngôi sao chết.", listedAt: daysAgo(0.3), createdAt: daysAgo(0.3), views: 2800, favorites: 198, status: "active", tags: ["Mạnh nhất"] },
  { id: "L-005", itemId: "IT-ASSET-002", itemName: "Cổng Chiều Thứ Chín", name: "Cổng Chiều Thứ Chín", image: "🌀", category: "world-assets", rarity: "mythic", seller: "PortalKeeper", sellerAvatar: "PK", price: 5500000, currency: "CR", originalValue: 6200000, quantity: 1, description: "Cổng kết nối chiều không gian thứ 9. Cực kỳ hiếm.", listedAt: daysAgo(3), createdAt: daysAgo(3), views: 2100, favorites: 176, status: "active", tags: ["Độc nhất"] },
  { id: "L-006", itemId: "IT-PET-002", itemName: "Aqua Belle – Tiên cá Huyền thoại", name: "Aqua Belle – Tiên cá Huyền thoại", image: "🧜", category: "pets", rarity: "legendary", seller: "OceanQueen", sellerAvatar: "OQ", price: 580000, currency: "CR", originalValue: 680000, quantity: 1, description: "Tiên cá huyền thoại kiểm soát đại dương. Cực đẹp.", listedAt: daysAgo(1.5), createdAt: daysAgo(1.5), views: 1900, favorites: 156, status: "active", tags: ["Nữ giới", "Nước"] },
  { id: "L-007", itemId: "IT-PLAYER-002", itemName: "Kai Müller – CM Huyền thoại", name: "Kai Müller – CM Huyền thoại", image: "⚽", category: "football", rarity: "legendary", seller: "GermanGK", sellerAvatar: "GG", price: 820000, currency: "CR", originalValue: 980000, quantity: 1, description: "Tiền vệ Vision Master rating 97. Chuyền bóng 99.", listedAt: daysAgo(2.5), createdAt: daysAgo(2.5), views: 1650, favorites: 122, status: "active", tags: ["Vision", "CM"] },
  { id: "L-008", itemId: "IT-ASSET-003", itemName: "Tháp Ngân Hà", name: "Tháp Ngân Hà", image: "🏛️", category: "world-assets", rarity: "legendary", seller: "GalaxyBuilder", sellerAvatar: "GB", price: 2600000, currency: "CR", originalValue: 2800000, quantity: 1, description: "Tòa tháp cao nhất World Creator Alpha. Thu nhập 24K/tuần.", listedAt: daysAgo(4), createdAt: daysAgo(4), views: 1300, favorites: 98, status: "active", tags: ["Thu nhập"] },
  { id: "L-009", itemId: "IT-ITEM-002", itemName: "Giáp Rồng Đen", name: "Giáp Rồng Đen", image: "🛡️", category: "items", rarity: "legendary", seller: "BlackDragon_V", sellerAvatar: "BD", price: 720000, currency: "CR", originalValue: 840000, quantity: 1, description: "+88% phòng thủ. Làm từ vảy rồng đen huyền bí.", listedAt: daysAgo(1.2), createdAt: daysAgo(1.2), views: 1100, favorites: 87, status: "active", tags: ["Phòng thủ"] },
  { id: "L-010", itemId: "IT-TICKET-001", itemName: "Vé Chung Kết Football Universe VIP", name: "Vé Chung Kết Football Universe VIP", image: "⭐", category: "tickets", rarity: "mythic", seller: "VIPKing", sellerAvatar: "VK", price: 340000, currency: "CR", originalValue: 380000, quantity: 1, description: "Hộp VIP Exclusive Zone EX-01. Còn 6 ngày đến sự kiện.", listedAt: daysAgo(0.8), createdAt: daysAgo(0.8), views: 3400, favorites: 287, status: "active", tags: ["Sắp diễn ra", "VIP"] },
  { id: "L-011", itemId: "IT-PET-003", itemName: "Sylphina – Nữ thần gió", name: "Sylphina – Nữ thần gió", image: "🌪️", category: "pets", rarity: "epic", seller: "WindRider", sellerAvatar: "WR", price: 230000, currency: "CR", originalValue: 280000, quantity: 1, description: "Tốc độ 990 – nhanh nhất trong các epic pets.", listedAt: daysAgo(3.5), createdAt: daysAgo(3.5), views: 880, favorites: 64, status: "active", tags: ["Tốc độ cao"] },
  { id: "L-012", itemId: "IT-ITEM-003", itemName: "Tinh Thạch Huyền Bí x10", name: "Tinh Thạch Huyền Bí x10", image: "💠", category: "items", rarity: "epic", seller: "CraftMaster", sellerAvatar: "CM", price: 270000, currency: "COIN", originalValue: 320000, quantity: 10, description: "Nguyên liệu chế tạo cấp S. Bộ 10 viên.", listedAt: daysAgo(2.2), createdAt: daysAgo(2.2), views: 760, favorites: 55, status: "active", tags: ["Craft", "x10"] },
  { id: "L-013", itemId: "IT-PLAYER-003", itemName: "Son Heung-Min – RW Huyền thoại", name: "Son Heung-Min – RW Huyền thoại", image: "⚽", category: "football", rarity: "legendary", seller: "KoreanKing", sellerAvatar: "KK", price: 590000, currency: "CR", originalValue: 660000, quantity: 1, description: "Counter Attack specialist. Pace 97, Shooting 91.", listedAt: daysAgo(5), createdAt: daysAgo(5), views: 1420, favorites: 105, status: "active", tags: ["Counter Attack"] },
  { id: "L-014", itemId: "IT-ASSET-004", itemName: "Sân Vận Động Vũ Trụ", name: "Sân Vận Động Vũ Trụ", image: "🏟️", category: "world-assets", rarity: "legendary", seller: "StadiumOwner", sellerAvatar: "SO", price: 1700000, currency: "CR", originalValue: 1900000, quantity: 1, description: "Sức chứa 500K khán giả. Thu nhập 14K CR/tuần.", listedAt: daysAgo(6), createdAt: daysAgo(6), views: 980, favorites: 82, status: "active", tags: ["Bóng đá", "Thu nhập"] },
  { id: "L-015", itemId: "IT-ITEM-004", itemName: "Bản Đồ Kho Báu Huyền Thoại x2", name: "Bản Đồ Kho Báu Huyền Thoại x2", image: "🗺️", category: "items", rarity: "legendary", seller: "TreasureHunter", sellerAvatar: "TH", price: 550000, currency: "CR", originalValue: 650000, quantity: 2, description: "Mở khóa vùng đất ẩn bậc S trong World Creator.", listedAt: daysAgo(1.8), createdAt: daysAgo(1.8), views: 640, favorites: 49, status: "active", tags: ["World Creator"] },
  { id: "L-016", itemId: "IT-ITEM-005", itemName: "Giày Tốc Độ Sấm Sét", name: "Giày Tốc Độ Sấm Sét", image: "👟", category: "items", rarity: "epic", seller: "SpeedDemon", sellerAvatar: "SD", price: 76000, currency: "CR", originalValue: 88000, quantity: 1, description: "+52% tốc độ di chuyển. Nhanh như tia sét.", listedAt: daysAgo(4.5), createdAt: daysAgo(4.5), views: 520, favorites: 41, status: "active", tags: ["Tốc độ"] },
  { id: "L-017", itemId: "IT-TICKET-002", itemName: "Vé Giải Đấu Pet Huyền Thoại VIP", name: "Vé Giải Đấu Pet Huyền Thoại VIP", image: "🎖️", category: "tickets", rarity: "legendary", seller: "EventPro", sellerAvatar: "EP", price: 160000, currency: "CR", originalValue: 185000, quantity: 1, description: "VIP Box A-01. Gặp nhà vô địch, Poster signed.", listedAt: daysAgo(2.8), createdAt: daysAgo(2.8), views: 720, favorites: 58, status: "active", tags: ["Pet Battle", "VIP"] },
  { id: "L-018", itemId: "IT-ASSET-005", itemName: "Đền Cổ Đại Luminos", name: "Đền Cổ Đại Luminos", image: "⛩️", category: "world-assets", rarity: "epic", seller: "AncientOne", sellerAvatar: "AO", price: 560000, currency: "CR", originalValue: 620000, quantity: 1, description: "Đền thờ 1000 năm tuổi với phép thuật cổ đại.", listedAt: daysAgo(7), createdAt: daysAgo(7), views: 430, favorites: 36, status: "active", tags: ["Monument"] },
  { id: "L-019", itemId: "IT-PET-004", itemName: "Voltrix – Sói Sấm Huyền thoại", name: "Voltrix – Sói Sấm Huyền thoại", image: "🐺", category: "pets", rarity: "legendary", seller: "StormPack", sellerAvatar: "SP", price: 540000, currency: "CR", originalValue: 620000, quantity: 1, description: "Lightning element. Attack 880, Speed 940.", listedAt: daysAgo(3.2), createdAt: daysAgo(3.2), views: 890, favorites: 71, status: "active", tags: ["Lightning", "Tấn công"] },
  { id: "L-020", itemId: "IT-ITEM-006", itemName: "Nhẫn Sức Mạnh Huyền Bí", name: "Nhẫn Sức Mạnh Huyền Bí", image: "💍", category: "items", rarity: "epic", seller: "RingForge", sellerAvatar: "RF", price: 60000, currency: "COIN", originalValue: 72000, quantity: 1, description: "+44% sức tấn công. Nhẫn cổ đại tăng cường.", listedAt: daysAgo(5.5), createdAt: daysAgo(5.5), views: 380, favorites: 29, status: "active", tags: ["Equipment"] },
  { id: "L-021", itemId: "IT-PET-005", itemName: "Luminos Prime – Phượng hoàng", name: "Luminos Prime – Phượng hoàng", image: "🦅", category: "pets", rarity: "mythic", seller: "LightBearer", sellerAvatar: "LB", price: 890000, currency: "CR", originalValue: 1050000, quantity: 1, description: "Ánh sáng vĩnh cửu, biểu tượng của sự hồi sinh.", listedAt: daysAgo(1.1), createdAt: daysAgo(1.1), views: 3800, favorites: 290, status: "active", tags: ["Light", "Hot"] },
  { id: "L-022", itemId: "IT-TICKET-003", itemName: "Vé Galaxy Music Festival Huyền thoại", name: "Vé Galaxy Music Festival Huyền thoại", image: "🎵", category: "tickets", rarity: "legendary", seller: "MusicLover", sellerAvatar: "ML", price: 142000, currency: "CR", originalValue: 162000, quantity: 1, description: "Legendary Stage + Backstage pass + Gặp nghệ sĩ.", listedAt: daysAgo(3.8), createdAt: daysAgo(3.8), views: 610, favorites: 47, status: "active", tags: ["Âm nhạc", "Backstage"] },
  { id: "L-023", itemId: "IT-ASSET-006", itemName: "Hầm Ngục Rồng Cổ Đại", name: "Hầm Ngục Rồng Cổ Đại", image: "🏚️", category: "world-assets", rarity: "legendary", seller: "DungeonLord", sellerAvatar: "DL", price: 1450000, currency: "CR", originalValue: 1600000, quantity: 1, description: "Kho báu + rồng cổ đại. Thu nhập 12K CR/tuần.", listedAt: daysAgo(8), createdAt: daysAgo(8), views: 780, favorites: 63, status: "active", tags: ["Dungeon", "Thu nhập"] },
  { id: "L-024", itemId: "IT-ITEM-007", itemName: "Thuốc Tăng Sức Mạnh Cấp S x5", name: "Thuốc Tăng Sức Mạnh Cấp S x5", image: "⚗️", category: "items", rarity: "epic", seller: "AlchemistPro", sellerAvatar: "AP", price: 48000, currency: "COIN", originalValue: 58000, quantity: 5, description: "+60% sức mạnh trong 48h. Hiệu quả mạnh nhất.", listedAt: daysAgo(6.5), createdAt: daysAgo(6.5), views: 290, favorites: 22, status: "active", tags: ["Consumable", "x5"] },
  { id: "L-025", itemId: "IT-PET-006", itemName: "Frostmaw – Gấu Băng Huyền thoại", name: "Frostmaw – Gấu Băng Huyền thoại", image: "🐻", category: "pets", rarity: "legendary", seller: "IceLord", sellerAvatar: "IL", price: 500000, currency: "CR", originalValue: 580000, quantity: 1, description: "Defense 920 – tank tốt nhất hiện tại.", listedAt: daysAgo(4.2), createdAt: daysAgo(4.2), views: 720, favorites: 58, status: "active", tags: ["Tank", "Ice"] },
  { id: "L-026", itemId: "IT-PLAYER-004", itemName: "Ronaldo Silva – ST Thần thoại", name: "Ronaldo Silva – ST Thần thoại", image: "⚽", category: "football", rarity: "mythic", seller: "BrazilStar", sellerAvatar: "BS", price: 2100000, currency: "CR", originalValue: 2200000, quantity: 1, description: "Đã bán.", listedAt: daysAgo(10), createdAt: daysAgo(10), views: 6200, favorites: 512, status: "sold", tags: [] },
  { id: "L-027", itemId: "IT-ASSET-007", itemName: "Tháp Thiên Hà Nguyên Thủy", name: "Tháp Thiên Hà Nguyên Thủy", image: "🗼", category: "world-assets", rarity: "mythic", seller: "CosmicLord_7", sellerAvatar: "CL", price: 9200000, currency: "CR", originalValue: 9800000, quantity: 1, description: "Đã bán.", listedAt: daysAgo(12), createdAt: daysAgo(12), views: 8800, favorites: 720, status: "sold", tags: [] },
  { id: "L-028", itemId: "IT-ITEM-008", itemName: "Giáp Vĩnh Cửu", name: "Giáp Vĩnh Cửu", image: "🛡️", category: "items", rarity: "mythic", seller: "GuardianX", sellerAvatar: "GX", price: 2200000, currency: "CR", originalValue: 2400000, quantity: 1, description: "Đã bán.", listedAt: daysAgo(8), createdAt: daysAgo(8), views: 3400, favorites: 280, status: "sold", tags: [] },
  { id: "L-029", itemId: "IT-ITEM-009", itemName: "Cờ Hiệu Đội Tuyển VIP x3", name: "Cờ Hiệu Đội Tuyển VIP x3", image: "🚩", category: "items", rarity: "epic", seller: "FanZone", sellerAvatar: "FZ", price: 38000, currency: "COIN", originalValue: 48000, quantity: 3, description: "Đã hết hạn.", listedAt: daysAgo(15), createdAt: daysAgo(15), views: 210, favorites: 14, status: "expired", tags: [] },
  { id: "L-030", itemId: "IT-ASSET-008", itemName: "Đảo Rồng – World Creator", name: "Đảo Rồng – World Creator", image: "🏝️", category: "world-assets", rarity: "legendary", seller: "IslandKing", sellerAvatar: "IK", price: 1280000, currency: "CR", originalValue: 1380000, quantity: 1, description: "Đã bán.", listedAt: daysAgo(9), createdAt: daysAgo(9), views: 2100, favorites: 178, status: "sold", tags: [] },
];

// ─── Auctions (20) ───────────────────────────────────────────────────────────

export const AUCTIONS: Auction[] = [
  {
    id: "A-001", itemId: "IT-PET-007", itemName: "Shadowfang – Mèo Bóng Đêm Huyền thoại", name: "Shadowfang – Mèo Bóng Đêm Huyền thoại", image: "🐱", category: "pets", rarity: "legendary",
    seller: "ShadowMaster", sellerAvatar: "SM", startPrice: 400000, minimumBid: 400000, currentBid: 488000, buyNowPrice: 650000,
    minIncrement: 5000, endTime: hoursFromNow(2.5), endDate: hoursFromNow(2.5), status: "active", watchers: 284, isHot: true,
    description: "Speed 950 – Dark element. Mèo huyền thoại tàng hình trong bóng tối.",
    bids: [
      { bidder: "CommanderZara", avatar: "CZ", amount: 488000, at: hoursFromNow(-0.5) },
      { bidder: "NightHunter_K", avatar: "NK", amount: 475000, at: hoursFromNow(-1.2) },
      { bidder: "DarkElf_V", avatar: "DE", amount: 460000, at: hoursFromNow(-2.1) },
      { bidder: "ShadowRogue", avatar: "SR", amount: 445000, at: hoursFromNow(-3.5) },
      { bidder: "PhantomBid", avatar: "PB", amount: 425000, at: hoursFromNow(-5.0) },
    ],
  },
  {
    id: "A-002", itemId: "IT-ITEM-010", itemName: "Kiếm Ngân Hà – Legendary Weapon", name: "Kiếm Ngân Hà – Legendary Weapon", image: "⚔️", category: "items", rarity: "legendary",
    seller: "GalaxySword", sellerAvatar: "GS", startPrice: 700000, minimumBid: 700000, currentBid: 824000, buyNowPrice: 1100000,
    minIncrement: 10000, endTime: hoursFromNow(6), endDate: hoursFromNow(6), status: "active", watchers: 198, isHot: true,
    description: "+95% sát thương. Đúc từ thiên thạch ngàn năm tuổi.",
    bids: [
      { bidder: "WarriorX", avatar: "WX", amount: 824000, at: hoursFromNow(-0.3) },
      { bidder: "SwordGod_Y", avatar: "SG", amount: 810000, at: hoursFromNow(-1.0) },
      { bidder: "BladeRunner", avatar: "BR", amount: 790000, at: hoursFromNow(-2.5) },
      { bidder: "MetalStorm", avatar: "MS", amount: 760000, at: hoursFromNow(-4.2) },
    ],
  },
  {
    id: "A-003", itemId: "IT-ASSET-009", itemName: "Cổng Thiên Đình – Epic Portal", name: "Cổng Thiên Đình – Epic Portal", image: "🌈", category: "world-assets", rarity: "epic",
    seller: "HeavenGate", sellerAvatar: "HG", startPrice: 380000, minimumBid: 380000, currentBid: 421000, buyNowPrice: 620000,
    minIncrement: 5000, endTime: hoursFromNow(18), endDate: hoursFromNow(18), status: "active", watchers: 142, isHot: false,
    description: "Kết nối tới thiên đình. Thu nhập 5,800 CR/tuần.",
    bids: [
      { bidder: "CelestialKing", avatar: "CK", amount: 421000, at: hoursFromNow(-1.5) },
      { bidder: "HeavenSeeker", avatar: "HS", amount: 405000, at: hoursFromNow(-3.2) },
      { bidder: "SkyWalker_Z", avatar: "SW", amount: 395000, at: hoursFromNow(-6.0) },
    ],
  },
  {
    id: "A-004", itemId: "IT-TICKET-004", itemName: "Vé Chung Kết Universe VIP Mythic", name: "Vé Chung Kết Universe VIP Mythic", image: "🏆", category: "tickets", rarity: "mythic",
    seller: "EventMaster", sellerAvatar: "EM", startPrice: 350000, minimumBid: 350000, currentBid: 472000, buyNowPrice: null,
    minIncrement: 8000, endTime: hoursFromNow(1.2), endDate: hoursFromNow(1.2), status: "active", watchers: 521, isHot: true,
    description: "Hộp Mythic M-00. Chuyên cơ riêng + gặp huyền thoại.",
    bids: [
      { bidder: "VIPKing_X", avatar: "VK", amount: 472000, at: hoursFromNow(-0.1) },
      { bidder: "Millionaire_Z", avatar: "MZ", amount: 464000, at: hoursFromNow(-0.4) },
      { bidder: "RichPlayer_A", avatar: "RP", amount: 450000, at: hoursFromNow(-0.8) },
      { bidder: "GoldBidder", avatar: "GB", amount: 432000, at: hoursFromNow(-1.5) },
      { bidder: "VIPCollector", avatar: "VC", amount: 415000, at: hoursFromNow(-2.2) },
      { bidder: "PlatinumUser", avatar: "PU", amount: 400000, at: hoursFromNow(-3.0) },
    ],
  },
  {
    id: "A-005", itemId: "IT-PLAYER-005", itemName: "Yuki Tanaka – LW Legendary Speed", name: "Yuki Tanaka – LW Legendary Speed", image: "⚽", category: "football", rarity: "legendary",
    seller: "JapanFC", sellerAvatar: "JF", startPrice: 600000, minimumBid: 600000, currentBid: 695000, buyNowPrice: 950000,
    minIncrement: 10000, endTime: hoursFromNow(36), endDate: hoursFromNow(36), status: "active", watchers: 167, isHot: false,
    description: "Pace 99 – Lightning Speed. Rating 95 LW.",
    bids: [
      { bidder: "SpeedFreak", avatar: "SF", amount: 695000, at: hoursFromNow(-2.0) },
      { bidder: "FastForward", avatar: "FF", amount: 680000, at: hoursFromNow(-5.5) },
      { bidder: "NitroPlayer", avatar: "NP", amount: 650000, at: hoursFromNow(-9.0) },
    ],
  },
  {
    id: "A-006", itemId: "IT-PET-008", itemName: "Tideborn – Epic Water Pet", name: "Tideborn – Epic Water Pet", image: "🐋", category: "pets", rarity: "epic",
    seller: "OceanDepth", sellerAvatar: "OD", startPrice: 160000, minimumBid: 160000, currentBid: 198000, buyNowPrice: 280000,
    minIncrement: 3000, endTime: hoursFromNow(12), endDate: hoursFromNow(12), status: "active", watchers: 88, isHot: false,
    description: "Cá kiếm khổng lồ từ vùng biển sâu. Speed 760.",
    bids: [
      { bidder: "WaterRider", avatar: "WR", amount: 198000, at: hoursFromNow(-1.8) },
      { bidder: "SeaLord_P", avatar: "SL", amount: 186000, at: hoursFromNow(-4.0) },
      { bidder: "AquaFan", avatar: "AF", amount: 172000, at: hoursFromNow(-7.5) },
    ],
  },
  {
    id: "A-007", itemId: "IT-ASSET-010", itemName: "Đảo Nổi Mây – Rare Land", name: "Đảo Nổi Mây – Rare Land", image: "☁️", category: "world-assets", rarity: "rare",
    seller: "SkyIsland", sellerAvatar: "SI", startPrice: 90000, minimumBid: 90000, currentBid: 112000, buyNowPrice: 180000,
    minIncrement: 2000, endTime: hoursFromNow(48), endDate: hoursFromNow(48), status: "active", watchers: 62, isHot: false,
    description: "Hòn đảo trôi nổi trên mây. Cảnh quan tuyệt đẹp.",
    bids: [
      { bidder: "CloudBuilder", avatar: "CB", amount: 112000, at: hoursFromNow(-3.5) },
      { bidder: "SkyDreamer", avatar: "SD", amount: 104000, at: hoursFromNow(-8.0) },
    ],
  },
  {
    id: "A-008", itemId: "IT-ITEM-011", itemName: "Bộ Giáp Vĩnh Cửu – Fragment x3", name: "Bộ Giáp Vĩnh Cửu – Fragment x3", image: "🛡️", category: "items", rarity: "epic",
    seller: "FragmentHunter", sellerAvatar: "FH", startPrice: 120000, minimumBid: 120000, currentBid: 155000, buyNowPrice: 220000,
    minIncrement: 5000, endTime: hoursFromNow(24), endDate: hoursFromNow(24), status: "active", watchers: 94, isHot: false,
    description: "3 mảnh giáp Eternal. Ghép đủ 5 mảnh để nhận giáp huyền thoại.",
    bids: [
      { bidder: "SetCollector", avatar: "SC", amount: 155000, at: hoursFromNow(-0.8) },
      { bidder: "ArmorKing_Z", avatar: "AK", amount: 145000, at: hoursFromNow(-2.5) },
      { bidder: "GearHunter", avatar: "GH", amount: 132000, at: hoursFromNow(-5.0) },
    ],
  },
  {
    id: "A-009", itemId: "IT-PET-009", itemName: "Pyrex – Cáo Lửa Rare", name: "Pyrex – Cáo Lửa Rare", image: "🦊", category: "pets", rarity: "rare",
    seller: "FireFox_K", sellerAvatar: "FK", startPrice: 60000, minimumBid: 60000, currentBid: 78000, buyNowPrice: 110000,
    minIncrement: 2000, endTime: hoursFromNow(72), endDate: hoursFromNow(72), status: "active", watchers: 41, isHot: false,
    description: "Fire element. Speed 720. Cute và hiệu quả.",
    bids: [
      { bidder: "FoxLover", avatar: "FL", amount: 78000, at: hoursFromNow(-5.0) },
      { bidder: "CutePetFan", avatar: "CP", amount: 70000, at: hoursFromNow(-12.0) },
    ],
  },
  {
    id: "A-010", itemId: "IT-PLAYER-006", itemName: "Luis Vargas – GK Legendary Iron Wall", name: "Luis Vargas – GK Legendary Iron Wall", image: "🧤", category: "football", rarity: "legendary",
    seller: "GoalieKing", sellerAvatar: "GK", startPrice: 550000, minimumBid: 550000, currentBid: 612000, buyNowPrice: 820000,
    minIncrement: 8000, endTime: hoursFromNow(3.8), endDate: hoursFromNow(3.8), status: "active", watchers: 156, isHot: true,
    description: "Defense 98. Iron Wall ability. Thủ môn tốt nhất.",
    bids: [
      { bidder: "DefenseFirst", avatar: "DF", amount: 612000, at: hoursFromNow(-0.6) },
      { bidder: "GoalKeeper_V", avatar: "GV", amount: 598000, at: hoursFromNow(-1.5) },
      { bidder: "WallBuilder", avatar: "WB", amount: 580000, at: hoursFromNow(-3.0) },
      { bidder: "IronGuard", avatar: "IG", amount: 565000, at: hoursFromNow(-4.8) },
    ],
  },
  {
    id: "A-011", itemId: "IT-PET-010", itemName: "Novalynx – Mèo Thiên Hà Mythic", name: "Novalynx – Mèo Thiên Hà Mythic", image: "🐆", category: "pets", rarity: "mythic",
    seller: "GalaxyHunter", sellerAvatar: "GH", startPrice: 800000, minimumBid: 800000, currentBid: 1020000, buyNowPrice: 1500000,
    minIncrement: 20000, endTime: hoursFromNow(4), endDate: hoursFromNow(4), status: "active", watchers: 380, isHot: true,
    description: "Mythic Agility 990. Stealth strike – Cosmic element. Cực kỳ hiếm.",
    bids: [
      { bidder: "StarChaser", avatar: "SC", amount: 1020000, at: hoursFromNow(-0.2) },
      { bidder: "CosmicHunter", avatar: "CH", amount: 990000, at: hoursFromNow(-1.0) },
      { bidder: "NightCrawler", avatar: "NC", amount: 950000, at: hoursFromNow(-2.5) },
      { bidder: "GalaxyDrifter", avatar: "GD", amount: 900000, at: hoursFromNow(-4.0) },
    ],
  },
  {
    id: "A-012", itemId: "IT-ITEM-012", itemName: "Cây Quyền Trượng Hỗn Nguyên Mythic", name: "Cây Quyền Trượng Hỗn Nguyên Mythic", image: "🔱", category: "items", rarity: "mythic",
    seller: "AncientMage", sellerAvatar: "AM", startPrice: 1200000, minimumBid: 1200000, currentBid: 1480000, buyNowPrice: null,
    minIncrement: 25000, endTime: hoursFromNow(8), endDate: hoursFromNow(8), status: "active", watchers: 445, isHot: true,
    description: "+150% phép thuật toàn cục. Đúc từ lõi vũ trụ đầu tiên.",
    bids: [
      { bidder: "MythicMage", avatar: "MM", amount: 1480000, at: hoursFromNow(-0.4) },
      { bidder: "SpellMaster", avatar: "SM", amount: 1440000, at: hoursFromNow(-1.5) },
      { bidder: "WizardKing", avatar: "WK", amount: 1380000, at: hoursFromNow(-3.0) },
      { bidder: "ArcaneGod", avatar: "AG", amount: 1300000, at: hoursFromNow(-5.5) },
      { bidder: "RuneMaster", avatar: "RM", amount: 1250000, at: hoursFromNow(-8.0) },
    ],
  },
  {
    id: "A-013", itemId: "IT-ASSET-011", itemName: "Rừng Tinh Linh Huyền Bí – Epic Land", name: "Rừng Tinh Linh Huyền Bí – Epic Land", image: "🌲", category: "world-assets", rarity: "epic",
    seller: "ForestKing", sellerAvatar: "FK", startPrice: 340000, minimumBid: 340000, currentBid: 398000, buyNowPrice: 580000,
    minIncrement: 6000, endTime: hoursFromNow(30), endDate: hoursFromNow(30), status: "active", watchers: 112, isHot: false,
    description: "Rừng huyền bí với tinh linh cổ đại. Thu nhập 4,200 CR/tuần.",
    bids: [
      { bidder: "NatureOwner", avatar: "NO", amount: 398000, at: hoursFromNow(-2.0) },
      { bidder: "ForestGuard", avatar: "FG", amount: 376000, at: hoursFromNow(-6.0) },
      { bidder: "ElfKing_Z", avatar: "EK", amount: 358000, at: hoursFromNow(-11.0) },
    ],
  },
  {
    id: "A-014", itemId: "IT-TICKET-005", itemName: "Vé Universe World Championship – Mythic Suite", name: "Vé Universe World Championship – Mythic Suite", image: "🎗️", category: "tickets", rarity: "mythic",
    seller: "ChampionHost", sellerAvatar: "CH", startPrice: 500000, minimumBid: 500000, currentBid: 682000, buyNowPrice: null,
    minIncrement: 12000, endTime: hoursFromNow(5), endDate: hoursFromNow(5), status: "active", watchers: 634, isHot: true,
    description: "Phòng Suite hạng Mythic. Tiếp xúc nhà vô địch Universe + quà lưu niệm độc quyền.",
    bids: [
      { bidder: "BillionaireX", avatar: "BX", amount: 682000, at: hoursFromNow(-0.1) },
      { bidder: "ElitePlayer_Z", avatar: "EP", amount: 664000, at: hoursFromNow(-0.5) },
      { bidder: "VIPGod", avatar: "VG", amount: 640000, at: hoursFromNow(-1.2) },
      { bidder: "RoyalBidder", avatar: "RB", amount: 612000, at: hoursFromNow(-2.0) },
      { bidder: "PlatinumKing", avatar: "PK", amount: 580000, at: hoursFromNow(-3.5) },
      { bidder: "DiamondUser", avatar: "DU", amount: 545000, at: hoursFromNow(-5.5) },
    ],
  },
  {
    id: "A-015", itemId: "IT-PLAYER-007", itemName: "Marco Neymar Jr – CAM Mythic", name: "Marco Neymar Jr – CAM Mythic", image: "👟", category: "football", rarity: "mythic",
    seller: "BrazilianMagic", sellerAvatar: "BM", startPrice: 1800000, minimumBid: 1800000, currentBid: 2150000, buyNowPrice: 3000000,
    minIncrement: 30000, endTime: hoursFromNow(14), endDate: hoursFromNow(14), status: "active", watchers: 890, isHot: true,
    description: "Dribbling 100. Skill Move God. Rating 99 CAM. Đây là huyền thoại sống.",
    bids: [
      { bidder: "FootballBoss", avatar: "FB", amount: 2150000, at: hoursFromNow(-0.3) },
      { bidder: "TopManager", avatar: "TM", amount: 2090000, at: hoursFromNow(-1.0) },
      { bidder: "EliteFC", avatar: "EF", amount: 2020000, at: hoursFromNow(-2.5) },
      { bidder: "GrandClub_Z", avatar: "GC", amount: 1960000, at: hoursFromNow(-4.5) },
      { bidder: "LegendCollector", avatar: "LC", amount: 1900000, at: hoursFromNow(-7.0) },
    ],
  },
  {
    id: "A-016", itemId: "IT-PET-011", itemName: "Stormclaw – Sư Tử Giông Bão Epic", name: "Stormclaw – Sư Tử Giông Bão Epic", image: "🦁", category: "pets", rarity: "epic",
    seller: "LionMaster_Z", sellerAvatar: "LM", startPrice: 180000, minimumBid: 180000, currentBid: 224000, buyNowPrice: 340000,
    minIncrement: 4000, endTime: hoursFromNow(20), endDate: hoursFromNow(20), status: "active", watchers: 97, isHot: false,
    description: "Storm element. Attack 820. Roar ability stuns enemies.",
    bids: [
      { bidder: "LionKing_B", avatar: "LK", amount: 224000, at: hoursFromNow(-1.5) },
      { bidder: "StormPet_X", avatar: "SP", amount: 212000, at: hoursFromNow(-4.0) },
      { bidder: "BeastTamer", avatar: "BT", amount: 198000, at: hoursFromNow(-8.0) },
    ],
  },
  {
    id: "A-017", itemId: "IT-ASSET-012", itemName: "Pháo Đài Thiên Không – Legendary Fortress", name: "Pháo Đài Thiên Không – Legendary Fortress", image: "🏰", category: "world-assets", rarity: "legendary",
    seller: "SkyFortress", sellerAvatar: "SF", startPrice: 850000, minimumBid: 850000, currentBid: 1020000, buyNowPrice: 1500000,
    minIncrement: 15000, endTime: hoursFromNow(40), endDate: hoursFromNow(40), status: "active", watchers: 203, isHot: false,
    description: "Pháo đài trên không với 5 tầng phòng thủ. Thu nhập 9,600 CR/tuần.",
    bids: [
      { bidder: "FortressOwner", avatar: "FO", amount: 1020000, at: hoursFromNow(-3.0) },
      { bidder: "CastleKing", avatar: "CK", amount: 980000, at: hoursFromNow(-8.0) },
      { bidder: "SkyDominator", avatar: "SD", amount: 930000, at: hoursFromNow(-15.0) },
      { bidder: "AirLord_Z", avatar: "AL", amount: 890000, at: hoursFromNow(-22.0) },
    ],
  },
  {
    id: "A-018", itemId: "IT-ITEM-013", itemName: "Đá Linh Hồn Nguyên Thủy Mythic x3", name: "Đá Linh Hồn Nguyên Thủy Mythic x3", image: "🔮", category: "items", rarity: "mythic",
    seller: "SoulForger", sellerAvatar: "SF", startPrice: 600000, minimumBid: 600000, currentBid: 740000, buyNowPrice: 1100000,
    minIncrement: 15000, endTime: hoursFromNow(16), endDate: hoursFromNow(16), status: "active", watchers: 318, isHot: true,
    description: "Nguyên liệu Mythic tối thượng. Dùng để forge vũ khí cấp S+.",
    bids: [
      { bidder: "Forgemaster", avatar: "FM", amount: 740000, at: hoursFromNow(-0.8) },
      { bidder: "CraftGod_X", avatar: "CG", amount: 714000, at: hoursFromNow(-2.5) },
      { bidder: "SmithKing_Z", avatar: "SK", amount: 685000, at: hoursFromNow(-5.0) },
      { bidder: "RuneForge_V", avatar: "RF", amount: 650000, at: hoursFromNow(-9.0) },
    ],
  },
  {
    id: "A-019", itemId: "IT-PET-012", itemName: "Crystaline – Bướm Tinh Thể Rare", name: "Crystaline – Bướm Tinh Thể Rare", image: "🦋", category: "pets", rarity: "rare",
    seller: "PetShop_X", sellerAvatar: "PX", startPrice: 45000, minimumBid: 45000, currentBid: 62000, buyNowPrice: 95000,
    minIncrement: 1500, endTime: hoursFromNow(96), endDate: hoursFromNow(96), status: "active", watchers: 33, isHot: false,
    description: "Crystal element. Support buff +15% cho toàn đội. Dễ thương.",
    bids: [
      { bidder: "ButterFan", avatar: "BF", amount: 62000, at: hoursFromNow(-6.0) },
      { bidder: "CutePetFan", avatar: "CP", amount: 55000, at: hoursFromNow(-18.0) },
    ],
  },
  {
    id: "A-020", itemId: "IT-PLAYER-008", itemName: "Adama Diallo – CDM Epic Destroyer", name: "Adama Diallo – CDM Destroyer", image: "⚽", category: "football", rarity: "epic",
    seller: "AfricaFC_Z", sellerAvatar: "AF", startPrice: 280000, minimumBid: 280000, currentBid: 348000, buyNowPrice: 520000,
    minIncrement: 7000, endTime: hoursFromNow(28), endDate: hoursFromNow(28), status: "active", watchers: 134, isHot: false,
    description: "Defending 95. Tackling God. Physical 94. Rating 93 CDM.",
    bids: [
      { bidder: "MidBlock_X", avatar: "MB", amount: 348000, at: hoursFromNow(-1.0) },
      { bidder: "DefensePro_V", avatar: "DP", amount: 328000, at: hoursFromNow(-4.5) },
      { bidder: "TackleKing", avatar: "TK", amount: 308000, at: hoursFromNow(-10.0) },
    ],
  },
];

// ─── Trades (20) ─────────────────────────────────────────────────────────────

export const TRADES: Trade[] = [
  { id: "TR-001", offeredItem: "Infernox – Rồng lửa Thần thoại",      requestedItem: "Kiếm Thần Thoại Vũ Trụ",         status: "pending"  },
  { id: "TR-002", offeredItem: "Aqua Belle – Tiên cá Huyền thoại",    requestedItem: "Voltrix – Sói Sấm Huyền thoại",  status: "pending"  },
  { id: "TR-003", offeredItem: "Luminos Prime – Phượng hoàng",         requestedItem: "El Dios – Cầu thủ Thần thoại",  status: "accepted" },
  { id: "TR-004", offeredItem: "Giáp Rồng Đen",                        requestedItem: "Tinh Thạch Huyền Bí x10",        status: "declined" },
  { id: "TR-005", offeredItem: "Voltrix – Sói Sấm Huyền thoại",       requestedItem: "Mỏ Tinh Thể Vũ Trụ",            status: "expired"  },
  { id: "TR-006", offeredItem: "Shadowfang – Mèo Bóng Đêm",           requestedItem: "Kiếm Ngân Hà – Legendary",      status: "pending"  },
  { id: "TR-007", offeredItem: "Frostmaw – Gấu Băng Huyền thoại",     requestedItem: "Sylphina – Nữ thần gió",         status: "accepted" },
  { id: "TR-008", offeredItem: "Tháp Ngân Hà",                         requestedItem: "Hầm Ngục Rồng Cổ Đại",          status: "cancelled"},
  { id: "TR-009", offeredItem: "Bản Đồ Kho Báu Huyền Thoại x2",       requestedItem: "Vé Chung Kết Universe VIP",      status: "pending"  },
  { id: "TR-010", offeredItem: "Kai Müller – CM Huyền thoại",          requestedItem: "Son Heung-Min – RW Huyền thoại", status: "accepted" },
  { id: "TR-011", offeredItem: "Novalynx – Mèo Thiên Hà Mythic",      requestedItem: "Cổng Chiều Thứ Chín",            status: "pending"  },
  { id: "TR-012", offeredItem: "Cây Quyền Trượng Hỗn Nguyên Mythic",  requestedItem: "Giáp Vĩnh Cửu",                  status: "declined" },
  { id: "TR-013", offeredItem: "Pyrex – Cáo Lửa Rare",                 requestedItem: "Crystaline – Bướm Tinh Thể",    status: "pending"  },
  { id: "TR-014", offeredItem: "Sân Vận Động Vũ Trụ",                  requestedItem: "Pháo Đài Thiên Không",           status: "expired"  },
  { id: "TR-015", offeredItem: "Giày Tốc Độ Sấm Sét",                  requestedItem: "Nhẫn Sức Mạnh Huyền Bí",        status: "accepted" },
  { id: "TR-016", offeredItem: "Vé Galaxy Music Festival",             requestedItem: "Vé Giải Đấu Pet Huyền Thoại",   status: "cancelled"},
  { id: "TR-017", offeredItem: "Đảo Nổi Mây – Rare Land",              requestedItem: "Đền Cổ Đại Luminos",             status: "pending"  },
  { id: "TR-018", offeredItem: "Luis Vargas – GK Iron Wall",            requestedItem: "Yuki Tanaka – LW Speed",         status: "declined" },
  { id: "TR-019", offeredItem: "Đá Linh Hồn Nguyên Thủy Mythic x3",   requestedItem: "Thuốc Tăng Sức Mạnh Cấp S x5",  status: "accepted" },
  { id: "TR-020", offeredItem: "Stormclaw – Sư Tử Giông Bão Epic",    requestedItem: "Tideborn – Epic Water Pet",      status: "pending"  },
];

// ─── Market Transactions (35) ─────────────────────────────────────────────────

export const MARKET_TRANSACTIONS: MarketTransaction[] = [
  { id: "TX-001", itemName: "Tháp Thiên Hà Nguyên Thủy", itemImage: "🗼", category: "world-assets", rarity: "mythic", buyer: "CosmicRich", buyerAvatar: "CR", seller: "CosmicLord_7", sellerAvatar: "CL", price: 9200000, type: "purchase", date: daysAgo(1), fee: 92000 },
  { id: "TX-002", itemName: "Ronaldo Silva – ST Mythic", itemImage: "⚽", category: "football", rarity: "mythic", buyer: "FootballBoss", buyerAvatar: "FB", seller: "BrazilStar", sellerAvatar: "BS", price: 2100000, type: "purchase", date: daysAgo(1.5), fee: 21000 },
  { id: "TX-003", itemName: "Kiếm Thần Thoại Vũ Trụ", itemImage: "🗡️", category: "items", rarity: "mythic", buyer: "WarGod_X", buyerAvatar: "WG", seller: "OldSword", sellerAvatar: "OS", price: 2650000, type: "auction_win", date: daysAgo(2), fee: 26500 },
  { id: "TX-004", itemName: "Giáp Vĩnh Cửu", itemImage: "🛡️", category: "items", rarity: "mythic", buyer: "TankMaster", buyerAvatar: "TM", seller: "GuardianX", sellerAvatar: "GX", price: 2200000, type: "purchase", date: daysAgo(2.2), fee: 22000 },
  { id: "TX-005", itemName: "El Dios – Cầu thủ Mythic", itemImage: "👑", category: "football", rarity: "mythic", buyer: "TopPlayer_Z", buyerAvatar: "TP", seller: "FootballGod", sellerAvatar: "FG", price: 2350000, type: "auction_win", date: daysAgo(3), fee: 23500 },
  { id: "TX-006", itemName: "Aqua Belle – Legendary", itemImage: "🧜", category: "pets", rarity: "legendary", buyer: "OceanFan", buyerAvatar: "OF", seller: "OceanQueen", sellerAvatar: "OQ", price: 640000, type: "purchase", date: daysAgo(3.5), fee: 6400 },
  { id: "TX-007", itemName: "Đảo Rồng", itemImage: "🏝️", category: "world-assets", rarity: "legendary", buyer: "IslandDreamer", buyerAvatar: "ID", seller: "IslandKing", sellerAvatar: "IK", price: 1280000, type: "purchase", date: daysAgo(4), fee: 12800 },
  { id: "TX-008", itemName: "Mỏ Kim Cương Alpha", itemImage: "💠", category: "world-assets", rarity: "legendary", buyer: "DiamondHunter", buyerAvatar: "DH", seller: "MineOwner", sellerAvatar: "MO", price: 2100000, type: "auction_win", date: daysAgo(4.5), fee: 21000 },
  { id: "TX-009", itemName: "Vé Chung Kết VIP Mythic", itemImage: "🏆", category: "tickets", rarity: "mythic", buyer: "VIPFan_Z", buyerAvatar: "VF", seller: "EventMaster", sellerAvatar: "EM", price: 420000, type: "auction_win", date: daysAgo(5), fee: 4200 },
  { id: "TX-010", itemName: "Son Heung-Min – Legendary", itemImage: "⚽", category: "football", rarity: "legendary", buyer: "KoreanFan", buyerAvatar: "KF", seller: "KoreanKing", sellerAvatar: "KK", price: 680000, type: "purchase", date: daysAgo(5.5), fee: 6800 },
  { id: "TX-011", itemName: "Tinh Thạch Huyền Bí x10", itemImage: "💠", category: "items", rarity: "epic", buyer: "CraftLord", buyerAvatar: "CL", seller: "CraftMaster", sellerAvatar: "CM", price: 290000, type: "purchase", date: daysAgo(6), fee: 2900 },
  { id: "TX-012", itemName: "Hầm Ngục Rồng Cổ Đại", itemImage: "🏚️", category: "world-assets", rarity: "legendary", buyer: "DungeonSeeker", buyerAvatar: "DS", seller: "DungeonLord", sellerAvatar: "DL", price: 1580000, type: "auction_win", date: daysAgo(6.5), fee: 15800 },
  { id: "TX-013", itemName: "Kai Müller – CM Legendary", itemImage: "⚽", category: "football", rarity: "legendary", buyer: "MidfielderFan", buyerAvatar: "MF", seller: "GermanGK", sellerAvatar: "GG", price: 870000, type: "purchase", date: daysAgo(7), fee: 8700 },
  { id: "TX-014", itemName: "Bản Đồ Kho Báu Huyền Thoại", itemImage: "🗺️", category: "items", rarity: "legendary", buyer: "MapHunter_X", buyerAvatar: "MH", seller: "TreasureHunter", sellerAvatar: "TH", price: 620000, type: "offer_accepted", date: daysAgo(7.5), fee: 6200 },
  { id: "TX-015", itemName: "Sylphina – Epic Wind", itemImage: "🌪️", category: "pets", rarity: "epic", buyer: "WindFan", buyerAvatar: "WF", seller: "WindRider", sellerAvatar: "WR", price: 248000, type: "purchase", date: daysAgo(8), fee: 2480 },
  { id: "TX-016", itemName: "Sân Vận Động Vũ Trụ", itemImage: "🏟️", category: "world-assets", rarity: "legendary", buyer: "StadiumBoss", buyerAvatar: "SB", seller: "StadiumOwner", sellerAvatar: "SO", price: 1750000, type: "purchase", date: daysAgo(8.5), fee: 17500 },
  { id: "TX-017", itemName: "Giày Tốc Độ Sấm Sét", itemImage: "👟", category: "items", rarity: "epic", buyer: "RunnerX", buyerAvatar: "RX", seller: "SpeedDemon", sellerAvatar: "SD", price: 79000, type: "purchase", date: daysAgo(9), fee: 790 },
  { id: "TX-018", itemName: "Voltrix – Sói Sấm Legendary", itemImage: "🐺", category: "pets", rarity: "legendary", buyer: "WolfPack_A", buyerAvatar: "WA", seller: "StormPack", sellerAvatar: "SP", price: 570000, type: "auction_win", date: daysAgo(9.5), fee: 5700 },
  { id: "TX-019", itemName: "Đền Cổ Đại Luminos", itemImage: "⛩️", category: "world-assets", rarity: "epic", buyer: "TempleGuard", buyerAvatar: "TG", seller: "AncientOne", sellerAvatar: "AO", price: 590000, type: "purchase", date: daysAgo(10), fee: 5900 },
  { id: "TX-020", itemName: "Vé Galaxy Music Festival", itemImage: "🎵", category: "tickets", rarity: "legendary", buyer: "MusicFan_Z", buyerAvatar: "MZ", seller: "MusicLover", sellerAvatar: "ML", price: 155000, type: "purchase", date: daysAgo(10.5), fee: 1550 },
  { id: "TX-021", itemName: "Stormclaw – Epic Lion", itemImage: "🦁", category: "pets", rarity: "epic", buyer: "LionKing_B", buyerAvatar: "LK", seller: "PetShop_Z", sellerAvatar: "PZ", price: 210000, type: "purchase", date: daysAgo(11), fee: 2100 },
  { id: "TX-022", itemName: "Tháp Canh Biên Giới", itemImage: "🏰", category: "world-assets", rarity: "epic", buyer: "FortressOwner", buyerAvatar: "FO", seller: "BorderGuard", sellerAvatar: "BG", price: 340000, type: "auction_win", date: daysAgo(11.5), fee: 3400 },
  { id: "TX-023", itemName: "Nhẫn Sức Mạnh Huyền Bí", itemImage: "💍", category: "items", rarity: "epic", buyer: "RingMaster", buyerAvatar: "RM", seller: "RingForge", sellerAvatar: "RF", price: 65000, type: "purchase", date: daysAgo(12), fee: 650 },
  { id: "TX-024", itemName: "Frostmaw – Ice Bear Legendary", itemImage: "🐻", category: "pets", rarity: "legendary", buyer: "IceFan_V", buyerAvatar: "IF", seller: "IceLord", sellerAvatar: "IL", price: 555000, type: "offer_accepted", date: daysAgo(12.5), fee: 5550 },
  { id: "TX-025", itemName: "Thuốc Tăng Sức Mạnh Cấp S x5", itemImage: "⚗️", category: "items", rarity: "epic", buyer: "Booster_K", buyerAvatar: "BK", seller: "AlchemistPro", sellerAvatar: "AP", price: 52000, type: "purchase", date: daysAgo(13), fee: 520 },
  { id: "TX-026", itemName: "Adama Diallo – CDM Epic", itemImage: "⚽", category: "football", rarity: "epic", buyer: "MidBlock_X", buyerAvatar: "MB", seller: "FranceFC", sellerAvatar: "FF", price: 305000, type: "purchase", date: daysAgo(14), fee: 3050 },
  { id: "TX-027", itemName: "Rừng Tinh Linh – Epic Land", itemImage: "🌲", category: "world-assets", rarity: "epic", buyer: "NatureOwner", buyerAvatar: "NO", seller: "ForestKing", sellerAvatar: "FK", price: 455000, type: "auction_win", date: daysAgo(15), fee: 4550 },
  { id: "TX-028", itemName: "Vé Pet Battle Championship", itemImage: "⚔️", category: "tickets", rarity: "epic", buyer: "BattleFan_Z", buyerAvatar: "BF", seller: "EventPro", sellerAvatar: "EP", price: 64000, type: "purchase", date: daysAgo(16), fee: 640 },
  { id: "TX-029", itemName: "Crystaline – Rare Butterfly", itemImage: "🦋", category: "pets", rarity: "rare", buyer: "ButterFan", buyerAvatar: "BF", seller: "PetShop_X", sellerAvatar: "PX", price: 82000, type: "purchase", date: daysAgo(17), fee: 820 },
  { id: "TX-030", itemName: "Đồng Bằng Tinh Khiết", itemImage: "🌾", category: "world-assets", rarity: "rare", buyer: "FarmOwner_K", buyerAvatar: "FO", seller: "LandSeller", sellerAvatar: "LS", price: 168000, type: "purchase", date: daysAgo(18), fee: 1680 },
  { id: "TX-031", itemName: "Trái Tim Tinh Thể x8", itemImage: "💎", category: "items", rarity: "rare", buyer: "UpgradePro", buyerAvatar: "UP", seller: "MaterialShop", sellerAvatar: "MS", price: 20000, type: "purchase", date: daysAgo(19), fee: 200 },
  { id: "TX-032", itemName: "Vé Hòa Nhạc Ánh Sao", itemImage: "🎻", category: "tickets", rarity: "epic", buyer: "MusicFan_A", buyerAvatar: "MA", seller: "EventPro", sellerAvatar: "EP", price: 55000, type: "purchase", date: daysAgo(20), fee: 550 },
  { id: "TX-033", itemName: "Hầm Kho Báu Cổ", itemImage: "🏺", category: "world-assets", rarity: "rare", buyer: "TreasureSeeker", buyerAvatar: "TS", seller: "OldRelic", sellerAvatar: "OR", price: 148000, type: "offer_accepted", date: daysAgo(21), fee: 1480 },
  { id: "TX-034", itemName: "Bộ Giáp Vĩnh Cửu Fragment", itemImage: "🛡️", category: "items", rarity: "epic", buyer: "ArmorCollect", buyerAvatar: "AC", seller: "FragmentHunter", sellerAvatar: "FH", price: 168000, type: "auction_win", date: daysAgo(22), fee: 1680 },
  { id: "TX-035", itemName: "Park Joon-Ho – Epic RW", itemImage: "⚽", category: "football", rarity: "epic", buyer: "KoreanSpeed", buyerAvatar: "KS", seller: "AsianFC", sellerAvatar: "AF", price: 275000, type: "purchase", date: daysAgo(23), fee: 2750 },
];

// ─── Analytics ────────────────────────────────────────────────────────────────

export const MARKET_VOLUME_TREND = [
  { label: "T1",  volume:  8_400_000, txCount: 12 },
  { label: "T2",  volume: 11_200_000, txCount: 16 },
  { label: "T3",  volume:  9_800_000, txCount: 14 },
  { label: "T4",  volume: 14_600_000, txCount: 21 },
  { label: "T5",  volume: 12_300_000, txCount: 18 },
  { label: "T6",  volume: 16_900_000, txCount: 24 },
  { label: "T7",  volume: 15_400_000, txCount: 22 },
  { label: "T8",  volume: 18_800_000, txCount: 28 },
  { label: "T9",  volume: 17_200_000, txCount: 25 },
  { label: "T10", volume: 21_400_000, txCount: 31 },
  { label: "T11", volume: 19_600_000, txCount: 29 },
  { label: "T12", volume: 24_100_000, txCount: 35 },
];

export const MARKET_CATEGORY_VOLUME = [
  { name: "Tài sản TG", value: 68_400_000, txCount: 18, color: "#34d399" },
  { name: "Cầu thủ",   value: 28_800_000, txCount: 24, color: "#60a5fa" },
  { name: "Thú cưng",  value: 21_200_000, txCount: 31, color: "#c084fc" },
  { name: "Vật phẩm",  value: 18_600_000, txCount: 45, color: "#f87171" },
  { name: "Vé",        value:  8_400_000, txCount: 22, color: "#fbbf24" },
];

export const TOP_SELLERS = [
  { name: "CosmicLord_7", avatar: "CL", sales: 4, volume: 18_600_000, rating: 4.9 },
  { name: "FootballGod",  avatar: "FG", sales: 3, volume:  7_250_000, rating: 5.0 },
  { name: "BrazilStar",   avatar: "BS", sales: 2, volume:  4_500_000, rating: 4.8 },
  { name: "GuardianX",    avatar: "GX", sales: 2, volume:  4_200_000, rating: 4.7 },
  { name: "DungeonLord",  avatar: "DL", sales: 3, volume:  3_800_000, rating: 4.6 },
];

// ─── Display metadata ─────────────────────────────────────────────────────────

export const RARITY_COLORS: Record<MarketRarity, { text: string; bg: string; border: string; glow: string }> = {
  common:    { text: "text-gray-400",   bg: "bg-gray-400/10",   border: "border-gray-400/25",   glow: "" },
  rare:      { text: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/25",   glow: "shadow-[0_0_14px_rgba(96,165,250,0.18)]" },
  epic:      { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/25", glow: "shadow-[0_0_16px_rgba(192,132,252,0.22)]" },
  legendary: { text: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/25",  glow: "shadow-[0_0_20px_rgba(251,191,36,0.26)]" },
  mythic:    { text: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/25",   glow: "shadow-[0_0_28px_rgba(251,113,133,0.35)]" },
};

export const RARITY_LABELS: Record<MarketRarity, string> = {
  common: "Thông thường", rare: "Hiếm", epic: "Sử thi", legendary: "Huyền thoại", mythic: "Thần thoại",
};

export const CATEGORY_META_MARKET: Record<ListingCategory, { label: string; icon: string; color: string }> = {
  pets:           { label: "Thú cưng",   icon: "🐾", color: "text-purple-400" },
  football:       { label: "Cầu thủ",   icon: "⚽", color: "text-blue-400" },
  "world-assets": { label: "Tài sản TG",icon: "🌍", color: "text-emerald-400" },
  tickets:        { label: "Vé",        icon: "🎫", color: "text-amber-400" },
  items:          { label: "Vật phẩm", icon: "🎒", color: "text-red-400" },
};

export const TX_TYPE_META: Record<TxType, { label: string; color: string; bg: string }> = {
  purchase:       { label: "Mua ngay",      color: "text-emerald-400", bg: "bg-emerald-400/10" },
  sale:           { label: "Bán",           color: "text-blue-400",    bg: "bg-blue-400/10" },
  auction_win:    { label: "Thắng đấu giá", color: "text-amber-400",   bg: "bg-amber-400/10" },
  auction_sold:   { label: "Bán đấu giá",   color: "text-purple-400",  bg: "bg-purple-400/10" },
  offer_accepted: { label: "Chốt giá",      color: "text-cyan-400",    bg: "bg-cyan-400/10" },
};
