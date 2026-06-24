import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Settings,
  Hexagon,
  Network,
  ServerCog,
  BarChart3,
  Layers,
  Cpu,
  Wallet,
  ArrowLeftRight,
  Gift,
  TrendingUp,
  PlusCircle,
  Package,
  PawPrint,
  Trophy,
  Globe,
  Ticket,
  Box,
  BarChart2,
  Warehouse,
  ShoppingBag,
  Gavel,
  Receipt,
  Store,
  Repeat2,
  Heart,
  Radio,
  Rocket,
} from "lucide-react";
import { MODULES } from "@/config/modules";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useMarketplaceFeed } from "@/hooks/useMarketplaceFeed";

const STATIC_NAV_TOP = [
  { icon: LayoutDashboard, label: "Bảng điều khiển", path: "/" },
  { icon: Network, label: "Bản đồ Vũ trụ", path: "/map" },
  { icon: ServerCog, label: "Đăng ký Dịch vụ", path: "/services" },
  { icon: Layers, label: "Quản lý Module", path: "/modules" },
  { icon: Cpu, label: "Kiến trúc HĐH", path: "/architecture" },
];

const STATIC_NAV_BOTTOM = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { count: watchlistCount } = useWatchlist();
  const { allPosts, stats } = useMarketplaceFeed();

  const isActive = (path: string) =>
    path === "/"
      ? location === "/"
      : location === path || location.startsWith(path);

  const NavItem = ({ icon: Icon, label, path, badge }: { icon: typeof LayoutDashboard; label: string; path: string; badge?: number }) => (
    <Link key={path} href={path}>
      <div
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group cursor-pointer",
          isActive(path)
            ? "bg-primary/10 text-primary border border-primary/20 neon-glow"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            isActive(path) ? "scale-110" : "group-hover:scale-110"
          )}
        />
        <span className={cn("font-medium tracking-wide flex-1", isActive(path) ? "neon-text" : "")}>
          {label}
        </span>
        {badge != null && badge > 0 && (
          <span className="min-w-[18px] h-[18px] rounded-full bg-rose-400/20 border border-rose-400/30 text-rose-400 text-[8px] font-mono font-bold flex items-center justify-center px-1">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
    </Link>
  );

  return (
    <aside className="w-[260px] h-screen flex-shrink-0 border-r border-white/5 glass-panel sticky top-0 hidden md:flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <Hexagon className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-wider text-white uppercase neon-text">
            UNIVERSE HUB
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {STATIC_NAV_TOP.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        <div className="pt-1 pb-1">
          <p className="px-4 py-2 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Ví
          </p>
          <NavItem icon={Wallet}          label="Tổng quan Ví"    path="/wallet" />
          <NavItem icon={PlusCircle}      label="Tạo Giao Dịch"   path="/wallet/create" />
          <NavItem icon={ArrowLeftRight}  label="Giao dịch"        path="/wallet/transactions" />
          <NavItem icon={Gift}            label="Phần thưởng"      path="/wallet/rewards" />
          <NavItem icon={TrendingUp}      label="Phân tích Ví"     path="/wallet/analytics" />
        </div>

        <div className="pt-1 pb-1">
          <p className="px-4 py-2 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Kho đồ
          </p>
          <NavItem icon={Package}   label="Tổng quan Kho"       path="/inventory" />
          <NavItem icon={PawPrint}  label="Thú cưng"            path="/inventory/pets" />
          <NavItem icon={Trophy}    label="Cầu thủ bóng đá"     path="/inventory/football" />
          <NavItem icon={Globe}     label="Tài sản Thế giới"    path="/inventory/world-assets" />
          <NavItem icon={Ticket}    label="Vé"                  path="/inventory/tickets" />
          <NavItem icon={Box}       label="Vật phẩm"            path="/inventory/items" />
          <NavItem icon={BarChart2}  label="Phân tích Kho"       path="/inventory/analytics" />
          <NavItem icon={Warehouse} label="Quản lý Kho hàng"   path="/inventory/warehouse" />
        </div>

        <div className="pt-1 pb-1">
          <p className="px-4 py-2 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Chợ trực tuyến
          </p>
          <NavItem icon={Store}       label="Bảng điều khiển Chợ" path="/marketplace" />
          <NavItem icon={ShoppingBag} label="Danh sách sản phẩm"  path="/marketplace/listings" />
          <NavItem icon={Gavel}       label="Đấu giá"             path="/marketplace/auctions" />
          <NavItem icon={Heart}       label="Danh sách theo dõi"  path="/marketplace/watchlist" badge={watchlistCount} />
          <NavItem icon={Repeat2}     label="Trao đổi"            path="/marketplace/trades" />
          <NavItem icon={Receipt}     label="Giao dịch"           path="/marketplace/transactions" />
          <NavItem icon={BarChart3}   label="Phân tích Chợ"       path="/marketplace/analytics" />
          <NavItem icon={Radio}       label="Hoạt động Trực tuyến" path="/marketplace/activity"  badge={stats.connectionState === "connected" ? allPosts.length : undefined} />
        </div>

        <div className="pt-1 pb-1">
          <p className="px-4 py-2 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Mô-đun
          </p>
          {MODULES.map((mod) => (
            <NavItem
              key={mod.navPath}
              icon={mod.navIcon}
              label={mod.title}
              path={mod.navPath}
            />
          ))}
        </div>

        <div className="pt-1 pb-1">
          <p className="px-4 py-2 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Phân tích
          </p>
          <a
            href="/ecosystem-analytics/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-ecosystem-analytics"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group cursor-pointer text-muted-foreground hover:bg-white/5 hover:text-white">
              <BarChart3 className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium tracking-wide">Phân tích Hệ sinh thái</span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40 border border-white/10 rounded px-1 py-0.5">↗</span>
            </div>
          </a>
        </div>

        <div className="pt-1">
          {STATIC_NAV_BOTTOM.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 text-xs text-muted-foreground/50 text-center font-mono">
        SYSTEM v4.7.2 // ONLINE
      </div>
    </aside>
  );
}
