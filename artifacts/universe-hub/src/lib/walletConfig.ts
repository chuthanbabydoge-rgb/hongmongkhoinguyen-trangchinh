// ─── Wallet UI Configuration ─────────────────────────────────────────────────
//
// Types and UI metadata for wallet currencies, transactions, and rewards.
// Balance values are populated at runtime by WalletContext from the real API.
// ─────────────────────────────────────────────────────────────────────────────

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

export interface MonthlyFlow {
  label: string;
  month: string;
  income: number;
  expense: number;
  net: number;
  txCount: number;
}

// ─── Currency UI config (balance/growth populated from API at runtime) ────────

export const CURRENCY_BALANCES: CurrencyBalance[] = [
  {
    id: "credits",
    name: "Credits",
    nameVi: "Tín dụng",
    symbol: "CR",
    balance: 0,
    growth: 0,
    lastUpdated: "—",
    color: "text-blue-400",
    glow: "shadow-[0_0_30px_rgba(96,165,250,0.2)]",
    border: "border-blue-500/25",
    bg: "bg-blue-500/10",
    chartColor: "#60a5fa",
    history: [],
  },
  {
    id: "coins",
    name: "Coins",
    nameVi: "Xu",
    symbol: "CO",
    balance: 0,
    growth: 0,
    lastUpdated: "—",
    color: "text-cyan-400",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.2)]",
    border: "border-cyan-500/25",
    bg: "bg-cyan-500/10",
    chartColor: "#22d3ee",
    history: [],
  },
  {
    id: "tokens",
    name: "Tokens",
    nameVi: "Token",
    symbol: "TK",
    balance: 0,
    growth: 0,
    lastUpdated: "—",
    color: "text-purple-400",
    glow: "shadow-[0_0_30px_rgba(192,132,252,0.2)]",
    border: "border-purple-500/25",
    bg: "bg-purple-500/10",
    chartColor: "#c084fc",
    history: [],
  },
  {
    id: "points",
    name: "Reward Points",
    nameVi: "Điểm thưởng",
    symbol: "RP",
    balance: 0,
    growth: 0,
    lastUpdated: "—",
    color: "text-amber-400",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.2)]",
    border: "border-amber-500/25",
    bg: "bg-amber-500/10",
    chartColor: "#fbbf24",
    history: [],
  },
];

// ─── Static reward catalog (progress tracked client-side; no backend API) ─────

export const REWARDS: Reward[] = [
  { id: "RW-01", title: "Chiến binh hàng ngày",     description: "Đăng nhập mỗi ngày trong tuần",          points: 0, maxPoints: 7,   category: "daily",       categoryLabel: "Hàng ngày",  expiresAt: "Còn 7 ngày", claimed: false, icon: "⚡" },
  { id: "RW-02", title: "Nhà giao dịch tuần",       description: "Thực hiện 10 giao dịch trong tuần",       points: 0, maxPoints: 10,  category: "weekly",      categoryLabel: "Hàng tuần", expiresAt: "Còn 7 ngày", claimed: false, icon: "💱" },
  { id: "RW-03", title: "Nhà thám hiểm vũ trụ",    description: "Truy cập 5 module khác nhau",             points: 0, maxPoints: 5,   category: "achievement", categoryLabel: "Thành tích", claimed: false, icon: "🚀" },
  { id: "RW-04", title: "Cột mốc 100K Tín dụng",   description: "Đạt 100,000 tín dụng trong ví",           points: 0, maxPoints: 100, category: "milestone",   categoryLabel: "Cột mốc",   claimed: false, icon: "💎" },
  { id: "RW-05", title: "Tổng tài sản 200K",        description: "Tổng giá trị ví vượt 200,000 tín dụng",  points: 0, maxPoints: 200, category: "milestone",   categoryLabel: "Cột mốc",   claimed: false, icon: "🏆" },
  { id: "RW-06", title: "Huấn luyện viên Football", description: "Thắng 50 trận Football Universe",         points: 0, maxPoints: 50,  category: "achievement", categoryLabel: "Thành tích", claimed: false, icon: "⚽" },
  { id: "RW-07", title: "Nhà chăn nuôi",            description: "Tiến hóa 10 sinh vật Animal Evolution",  points: 0, maxPoints: 10,  category: "achievement", categoryLabel: "Thành tích", claimed: false, icon: "🐾" },
  { id: "RW-08", title: "Hoạt động hàng ngày",      description: "Thực hiện ít nhất 1 giao dịch mỗi ngày", points: 0, maxPoints: 5,   category: "daily",       categoryLabel: "Hàng ngày", expiresAt: "Còn 7 ngày", claimed: false, icon: "📊" },
];
