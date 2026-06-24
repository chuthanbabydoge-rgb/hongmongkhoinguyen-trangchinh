import { useLocation } from "wouter";
import { Clock, ExternalLink, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useLauncherStore, type RecentApp } from "@/hooks/useLauncherStore";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function AppRow({ app, index }: { app: RecentApp; index: number }) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/apps/${app.slug}`);
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group text-left"
    >
      <div className="w-8 h-8 rounded-lg border border-white/8 bg-primary/5 flex items-center justify-center flex-shrink-0">
        {app.icon ? (
          <img src={app.icon} alt={app.name} className="w-full h-full object-cover rounded-lg" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <Rocket className="w-4 h-4 text-primary/50" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/80 group-hover:text-white truncate transition-colors">
          {app.name}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/40 truncate">
          {timeAgo(app.openedAt)}
        </p>
      </div>
      <ExternalLink className="w-3 h-3 text-muted-foreground/20 group-hover:text-primary/50 flex-shrink-0 transition-colors" />
    </motion.button>
  );
}

export function RecentApps() {
  const { recentApps } = useLauncherStore();

  if (recentApps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/8 bg-white/2 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary/70" />
        <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-white/60">
          Recently Opened Apps
        </h2>
        <span className={cn(
          "ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border",
          "border-white/10 bg-white/3 text-muted-foreground/40",
        )}>
          {recentApps.length}
        </span>
      </div>

      <div className="space-y-0.5">
        {recentApps.map((app, i) => (
          <AppRow key={app.slug} app={app} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
