import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Settings,
  Hexagon,
} from "lucide-react";
import { MODULES } from "@/config/modules";
import { cn } from "@/lib/utils";

const STATIC_NAV_TOP = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
];

const STATIC_NAV_BOTTOM = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) =>
    path === "/"
      ? location === "/"
      : location === path || location.startsWith(path);

  const NavItem = ({ icon: Icon, label, path }: { icon: typeof LayoutDashboard; label: string; path: string }) => (
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
        <span className={cn("font-medium tracking-wide", isActive(path) ? "neon-text" : "")}>
          {label}
        </span>
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
            Modules
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
