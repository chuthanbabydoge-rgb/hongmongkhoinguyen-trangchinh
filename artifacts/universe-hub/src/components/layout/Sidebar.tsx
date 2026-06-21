import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Globe2, 
  Trophy, 
  Dna, 
  ShieldCheck, 
  ArrowLeftRight, 
  Bot, 
  Glasses, 
  Settings,
  Hexagon
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Globe2, label: "Worlds", path: "/worlds" },
  { icon: Trophy, label: "Football Universe", path: "/football" },
  { icon: Dna, label: "Animal Evolution", path: "/evolution" },
  { icon: ShieldCheck, label: "SafePass", path: "/safepass" },
  { icon: ArrowLeftRight, label: "Exchange Hub", path: "/exchange" },
  { icon: Bot, label: "AI Companion", path: "/ai" },
  { icon: Glasses, label: "XR Worlds", path: "/xr" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

export function Sidebar() {
  const [location] = useLocation();

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
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group cursor-pointer",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 neon-glow" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className={cn(
                  "font-medium tracking-wide",
                  isActive ? "neon-text" : ""
                )}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/5 text-xs text-muted-foreground/50 text-center font-mono">
        SYSTEM v4.7.2 // ONLINE
      </div>
    </aside>
  );
}
