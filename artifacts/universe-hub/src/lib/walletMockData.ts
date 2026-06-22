export interface CurrencyBalance {
  id: string;
  name: string;
  nameVi: string;
  symbol: string;
  balance: number;
  growth: number;
  lastUpdated: string;
  color: string;
  glow: string;
  border: string;
  bg: string;
  chartColor: string;
  history: number[];
}

export interface Transaction {
  id: string;
  date: string;
  type: "receive" | "send" | "purchase" | "reward" | "convert";
  typeLabel: string;
  amount: number;
  currency: "credits" | "coins" | "tokens" | "points";
  currencyLabel: string;
  status: "completed" | "pending" | "failed";
  note: string;
  from?: string;
  to?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  maxPoints: number;
  category: "daily" | "weekly" | "achievement" | "milestone";
  categoryLabel: string;
  expiresAt?: string;
  claimed: boolean;
  icon: string;
}

export interface AnalyticPoint {
  label: string;
  credits: number;
  coins: number;
  tokens: number;
  points: number;
  volume: number;
}

// ─── Balances ───────────────────────────────────────────────────────────────

export const CURRENCY_BALANCES: CurrencyBalance[] = [
  {
    id: "credits",
    name: "Credits",
    nameVi: "Tín dụng",
    symbol: "CR",
    balance: 125_840,
    growth: 12.4,
    lastUpdated: "2 phút trước",
    color: "text-blue-400",
    glow: "shadow-[0_0_30px_rgba(96,165,250,0.2)]",
    border: "border-blue-500/25",
    bg: "bg-blue-500/10",
    chartColor: "#60a5fa",
    history: [90000, 95000, 88000, 102000, 110000, 108000, 115000, 120000, 118000, 125840],
  },
  {
    id: "coins",
    name: "Coins",
    nameVi: "Xu",
    symbol: "CO",
    balance: 48_290,
    growth: 8.7,
    lastUpdated: "5 phút trước",
    color: "text-cyan-400",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.2)]",
    border: "border-cyan-500/25",
    bg: "bg-cyan-500/10",
    chartColor: "#22d3ee",
    history: [30000, 32000, 35000, 34000, 38000, 40000, 42000, 45000, 47000, 48290],
  },
  {
    id: "tokens",
    name: "Tokens",
    nameVi: "Token",
    symbol: "TK",
    balance: 3_750,
    growth: 24.1,
    lastUpdated: "1 phút trước",
    color: "text-purple-400",
    glow: "shadow-[0_0_30px_rgba(192,132,252,0.2)]",
    border: "border-purple-500/25",
    bg: "bg-purple-500/10",
    chartColor: "#c084fc",
    history: [1800, 2000, 2200, 2400, 2600, 2900, 3100, 3300, 3600, 3750],
  },
  {
    id: "points",
    name: "Reward Points",
    nameVi: "Điểm thưởng",
    symbol: "RP",
    balance: 9_120,
    growth: 31.5,
    lastUpdated: "Vừa xong",
    color: "text-amber-400",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.2)]",
    border: "border-amber-500/25",
    bg: "bg-amber-500/10",
    chartColor: "#fbbf24",
    history: [3000, 4000, 4500, 5200, 5800, 6500, 7000, 7800, 8500, 9120],
  },
];

// ─── Transactions ────────────────────────────────────────────────────────────

export const TRANSACTIONS: Transaction[] = [
  { id: "TX-0041", date: "21/06/2026 19:45", type: "receive",  typeLabel: "Nhận",       amount: 5000,   currency: "credits", currencyLabel: "Tín dụng", status: "completed", note: "Hoàn tiền từ World Creator",    from: "World Creator" },
  { id: "TX-0040", date: "21/06/2026 18:10", type: "purchase", typeLabel: "Mua",         amount: -1200,  currency: "coins",   currencyLabel: "Xu",       status: "completed", note: "Mua vật phẩm Animal Evolution",  to: "Animal Evolution" },
  { id: "TX-0039", date: "21/06/2026 15:33", type: "reward",   typeLabel: "Phần thưởng", amount: 250,    currency: "points",  currencyLabel: "Điểm thưởng", status: "completed", note: "Hoàn thành nhiệm vụ hàng ngày" },
  { id: "TX-0038", date: "21/06/2026 12:00", type: "convert",  typeLabel: "Chuyển đổi",  amount: -500,   currency: "credits", currencyLabel: "Tín dụng", status: "completed", note: "Đổi Credits → Coins (1:2)",      to: "Exchange Hub" },
  { id: "TX-0037", date: "21/06/2026 12:00", type: "receive",  typeLabel: "Nhận",        amount: 1000,   currency: "coins",   currencyLabel: "Xu",       status: "completed", note: "Đổi Credits → Coins (1:2)",      from: "Exchange Hub" },
  { id: "TX-0036", date: "20/06/2026 22:15", type: "purchase", typeLabel: "Mua",         amount: -75,    currency: "tokens",  currencyLabel: "Token",    status: "pending",   note: "Mua gói XR Football Premium",    to: "XR Football" },
  { id: "TX-0035", date: "20/06/2026 20:00", type: "reward",   typeLabel: "Phần thưởng", amount: 500,    currency: "points",  currencyLabel: "Điểm thưởng", status: "completed", note: "Cột mốc: 100 trận Football Universe" },
  { id: "TX-0034", date: "20/06/2026 17:44", type: "send",     typeLabel: "Gửi",         amount: -2500,  currency: "credits", currencyLabel: "Tín dụng", status: "completed", note: "Chuyển cho bạn bè",              to: "USER-7821" },
  { id: "TX-0033", date: "20/06/2026 11:20", type: "receive",  typeLabel: "Nhận",        amount: 10000,  currency: "credits", currencyLabel: "Tín dụng", status: "completed", note: "Nạp tiền từ ví ngoài",           from: "External Wallet" },
  { id: "TX-0032", date: "19/06/2026 23:58", type: "purchase", typeLabel: "Mua",         amount: -350,   currency: "coins",   currencyLabel: "Xu",       status: "failed",    note: "Mua đất World Creator (lỗi)",    to: "World Creator" },
  { id: "TX-0031", date: "19/06/2026 18:30", type: "reward",   typeLabel: "Phần thưởng", amount: 100,    currency: "points",  currencyLabel: "Điểm thưởng", status: "completed", note: "Đăng nhập liên tiếp 7 ngày" },
  { id: "TX-0030", date: "19/06/2026 09:00", type: "receive",  typeLabel: "Nhận",        amount: 200,    currency: "tokens",  currencyLabel: "Token",    status: "completed", note: "Phần thưởng sự kiện tháng 6",    from: "Event System" },
];

// ─── Rewards ─────────────────────────────────────────────────────────────────

export const REWARDS: Reward[] = [
  { id: "RW-01", title: "Chiến binh hàng ngày",    description: "Đăng nhập mỗi ngày trong tuần",           points: 5,    maxPoints: 7,   category: "daily",       categoryLabel: "Hàng ngày",    expiresAt: "Còn 2 ngày",  claimed: false, icon: "⚡" },
  { id: "RW-02", title: "Nhà giao dịch tuần",      description: "Thực hiện 10 giao dịch trong tuần",        points: 8,    maxPoints: 10,  category: "weekly",      categoryLabel: "Hàng tuần",   expiresAt: "Còn 4 ngày",  claimed: false, icon: "💱" },
  { id: "RW-03", title: "Nhà thám hiểm vũ trụ",   description: "Truy cập 5 module khác nhau",              points: 5,    maxPoints: 5,   category: "achievement", categoryLabel: "Thành tích",   claimed: true,  icon: "🚀" },
  { id: "RW-04", title: "Cột mốc 100K Tín dụng",  description: "Đạt 100,000 tín dụng trong ví",            points: 100,  maxPoints: 100, category: "milestone",   categoryLabel: "Cột mốc",      claimed: true,  icon: "💎" },
  { id: "RW-05", title: "Tổng tài sản 200K",       description: "Tổng giá trị ví vượt 200,000 tín dụng",   points: 0,    maxPoints: 200, category: "milestone",   categoryLabel: "Cột mốc",      claimed: false, icon: "🏆" },
  { id: "RW-06", title: "Huấn luyện viên Football", description: "Thắng 50 trận Football Universe",         points: 38,   maxPoints: 50,  category: "achievement", categoryLabel: "Thành tích",   claimed: false, icon: "⚽" },
  { id: "RW-07", title: "Nhà chăn nuôi",           description: "Tiến hóa 10 sinh vật Animal Evolution",   points: 6,    maxPoints: 10,  category: "achievement", categoryLabel: "Thành tích",   claimed: false, icon: "🐾" },
  { id: "RW-08", title: "Hoạt động hàng ngày",     description: "Thực hiện ít nhất 1 giao dịch mỗi ngày",  points: 3,    maxPoints: 5,   category: "daily",       categoryLabel: "Hàng ngày",    expiresAt: "Còn 2 ngày",  claimed: false, icon: "📊" },
];

// ─── Monthly cash-flow (income / expense breakdown) ──────────────────────────

export interface MonthlyFlow {
  label: string;
  month: string;
  income: number;
  expense: number;
  net: number;
  txCount: number;
}

export const MONTHLY_FLOW: MonthlyFlow[] = [
  { label: "T1", month: "Tháng 1/2026", income: 45_200, expense: 28_400, net: 16_800, txCount: 42 },
  { label: "T2", month: "Tháng 2/2026", income: 52_800, expense: 35_100, net: 17_700, txCount: 51 },
  { label: "T3", month: "Tháng 3/2026", income: 61_500, expense: 42_300, net: 19_200, txCount: 58 },
  { label: "T4", month: "Tháng 4/2026", income: 58_000, expense: 38_600, net: 19_400, txCount: 55 },
  { label: "T5", month: "Tháng 5/2026", income: 73_400, expense: 48_200, net: 25_200, txCount: 67 },
  { label: "T6", month: "Tháng 6/2026", income: 91_200, expense: 55_300, net: 35_900, txCount: 78 },
];

// ─── Analytics ───────────────────────────────────────────────────────────────

export const ANALYTICS_WEEKLY: AnalyticPoint[] = [
  { label: "T2", credits: 112000, coins: 43000, tokens: 3200, points: 7500, volume: 8200 },
  { label: "T3", credits: 115000, coins: 44500, tokens: 3350, points: 7900, volume: 12400 },
  { label: "T4", credits: 113000, coins: 45000, tokens: 3400, points: 8100, volume: 6800 },
  { label: "T5", credits: 118000, coins: 46200, tokens: 3500, points: 8400, volume: 15600 },
  { label: "T6", credits: 121000, coins: 47000, tokens: 3600, points: 8700, volume: 9300 },
  { label: "T7", credits: 124000, coins: 47800, tokens: 3700, points: 8900, volume: 11100 },
  { label: "CN", credits: 125840, coins: 48290, tokens: 3750, points: 9120, volume: 7800 },
];

export const ANALYTICS_MONTHLY: AnalyticPoint[] = [
  { label: "T1", credits: 80000,  coins: 28000, tokens: 1200, points: 2500, volume: 45000 },
  { label: "T2", credits: 85000,  coins: 30000, tokens: 1500, points: 3200, volume: 52000 },
  { label: "T3", credits: 92000,  coins: 33000, tokens: 1900, points: 4100, volume: 61000 },
  { label: "T4", credits: 98000,  coins: 37000, tokens: 2400, points: 5300, volume: 58000 },
  { label: "T5", credits: 105000, coins: 41000, tokens: 2900, points: 6800, volume: 73000 },
  { label: "T6", credits: 125840, coins: 48290, tokens: 3750, points: 9120, volume: 91000 },
];

export const DISTRIBUTION_DATA = [
  { name: "Tín dụng", value: 125840, color: "#60a5fa" },
  { name: "Xu",       value: 48290,  color: "#22d3ee" },
  { name: "Token",    value: 3750,   color: "#c084fc" },
  { name: "Điểm",    value: 9120,   color: "#fbbf24" },
];
