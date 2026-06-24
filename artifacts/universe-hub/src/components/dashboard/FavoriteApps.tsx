import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Star, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useLauncherStore } from "@/hooks/useLauncherStore";
import { fetchApps, type EcosystemApp } from "@/services/appRegistryService";
import { cn } from "@/lib/utils";

function FavCard({ app, index }: { app: EcosystemApp; index: number }) {
  const [, navigate] = useLocation();
  const { toggleFavorite } = useLauncherStore();
  const isActive = app.status === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative group rounded-xl border border-white/8 bg-white/3 p-4 flex flex-col gap-3 hover:border-primary/25 hover:bg-white/5 transition-all duration-200"
    >
      <button
        onClick={e => { e.stopPropagation(); toggleFavorite(app.slug); }}
        className="absolute top-3 right-3 text-amber-400 hover:text-amber-300 transition-colors"
        title="Bỏ yêu thích"
      >
        <Star className="w-3.5 h-3.5 fill-current" />
      </button>

      <div className="w-9 h-9 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center flex-shrink-0">
        {app.icon ? (
          <img src={app.icon} alt={app.name} className="w-full h-full object-cover rounded-lg" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <Rocket className="w-4 h-4 text-primary/50" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/80 truncate">{app.name}</p>
        {app.description && (
          <p className="text-[10px] text-muted-foreground/45 line-clamp-2 leading-relaxed mt-0.5">
            {app.description}
          </p>
        )}
      </div>

      {isActive && app.url ? (
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Mở →
        </a>
      ) : isActive ? (
        <button
          onClick={() => navigate(`/apps/${app.slug}`)}
          className="text-[10px] font-mono font-semibold text-primary hover:text-primary/80 transition-colors text-left"
        >
          Chi tiết →
        </button>
      ) : (
        <span className={cn(
          "text-[10px] font-mono tracking-widest text-muted-foreground/30 uppercase",
        )}>
          Coming Soon
        </span>
      )}
    </motion.div>
  );
}

export function FavoriteApps() {
  const { favorites } = useLauncherStore();

  const { data: allApps } = useQuery({
    queryKey:  ["apps"],
    queryFn:   fetchApps,
    staleTime: 30_000,
  });

  const favApps = allApps?.filter(a => favorites.includes(a.slug)) ?? [];

  if (favApps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-white/8 bg-white/2 p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-white/60">
          Favorite Apps
        </h2>
        <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/3 text-muted-foreground/40">
          {favApps.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {favApps.map((app, i) => (
          <FavCard key={app.id} app={app} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
