import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { fetchApps, type EcosystemApp, type AppStatus } from "@/services/appRegistryService";
import { cn } from "@/lib/utils";
import {
  ExternalLink, AlertTriangle, RefreshCw, Rocket,
  Zap, Shield, Globe, Users, Brain, TrendingUp, Box, Layers,
} from "lucide-react";

// ─── Background ───────────────────────────────────────────────────────────────

const BG = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-900/10 via-background to-background" />
    <div
      className="absolute inset-0 opacity-[0.022]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[140px]" />
    <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px]" />
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_META: Record<AppStatus, { label: string; cls: string; dot: string }> = {
  ACTIVE:      { label: "Active",      cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400", dot: "bg-emerald-400" },
  MAINTENANCE: { label: "Maintenance", cls: "bg-amber-500/10  border-amber-500/25  text-amber-400",   dot: "bg-amber-400"   },
  INACTIVE:    { label: "Inactive",    cls: "bg-slate-500/10  border-slate-500/25  text-slate-400",   dot: "bg-slate-400"   },
};

function StatusBadge({ status }: { status: AppStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.INACTIVE;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold tracking-wider uppercase",
      m.cls,
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", m.dot, status === "ACTIVE" && "animate-pulse")} />
      {m.label}
    </span>
  );
}

// ─── Category icon ────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, React.ElementType> = {
  SPORT:    TrendingUp,
  ANIMAL:   Layers,
  WORLD:    Globe,
  FINANCE:  TrendingUp,
  SECURITY: Shield,
  SOCIAL:   Users,
  AI:       Brain,
  UTILITY:  Box,
  OTHER:    Zap,
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-white/8" />
        <div className="w-20 h-5 rounded-full bg-white/8" />
      </div>
      <div className="space-y-2">
        <div className="h-4 rounded bg-white/8 w-3/4" />
        <div className="h-3 rounded bg-white/5 w-full" />
        <div className="h-3 rounded bg-white/5 w-2/3" />
      </div>
      <div className="h-3 rounded bg-white/5 w-1/3 mt-auto" />
    </div>
  );
}

// ─── App icon ─────────────────────────────────────────────────────────────────

function AppIcon({ app }: { app: EcosystemApp }) {
  const FallbackIcon = CATEGORY_ICON[app.category] ?? Zap;
  const [imgErr, setImgErr] = useState(false);

  if (app.icon && !imgErr) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black/30 flex-shrink-0 flex items-center justify-center">
        <img
          src={app.icon}
          alt={app.name}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center flex-shrink-0">
      <FallbackIcon className="w-6 h-6 text-primary/70" />
    </div>
  );
}

// ─── App card ─────────────────────────────────────────────────────────────────

function AppCard({ app, index }: { app: EcosystemApp; index: number }) {
  const [, navigate] = useLocation();

  function handleClick() {
    if (app.url) {
      window.open(app.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/apps/${app.slug}`);
    }
  }

  const isClickable = app.status === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        "group relative rounded-xl border bg-white/3 p-5 flex flex-col gap-3 transition-all duration-300",
        isClickable
          ? "border-white/8 hover:border-primary/30 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] cursor-pointer"
          : "border-white/5 opacity-50 cursor-not-allowed",
      )}
    >
      {/* Hover glow overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/3 group-hover:to-cyan-500/3 transition-all duration-500 pointer-events-none" />

      {/* Header: icon + status */}
      <div className="relative flex items-start justify-between gap-3">
        <AppIcon app={app} />
        <StatusBadge status={app.status} />
      </div>

      {/* Name + description */}
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className={cn(
            "font-semibold text-sm truncate transition-colors duration-200",
            isClickable ? "text-white/90 group-hover:text-white" : "text-white/40",
          )}>
            {app.name}
          </h3>
          {isClickable && app.url && (
            <ExternalLink className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/60 flex-shrink-0 transition-colors duration-200" />
          )}
        </div>
        {app.description && (
          <p className="text-xs text-muted-foreground/55 line-clamp-2 leading-relaxed">
            {app.description}
          </p>
        )}
      </div>

      {/* Footer: version + category */}
      <div className="relative flex items-center justify-between pt-2 border-t border-white/5">
        <span className="font-mono text-[10px] text-muted-foreground/35 tracking-wider">
          v{app.version}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/25 tracking-widest uppercase">
          {app.category}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Category filter pills ────────────────────────────────────────────────────

const ALL_CATS = [
  "TẤT CẢ", "SPORT", "ANIMAL", "WORLD", "FINANCE",
  "SECURITY", "SOCIAL", "AI", "UTILITY", "OTHER",
] as const;
type FilterCat = typeof ALL_CATS[number];

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="w-16 h-16 rounded-full border border-rose-500/25 bg-rose-500/5 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-rose-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/80 mb-1">Không thể tải danh sách ứng dụng</p>
        <p className="text-xs text-muted-foreground/60 max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Thử lại
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full border border-white/10 bg-white/3 flex items-center justify-center">
        <Rocket className="w-7 h-7 text-muted-foreground/30" />
      </div>
      <p className="text-sm text-muted-foreground/50">Chưa có ứng dụng nào được đăng ký</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Launcher() {
  const [activeFilter, setActiveFilter] = useState<FilterCat>("TẤT CẢ");

  const {
    data: apps,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["apps"],
    queryFn:  fetchApps,
    staleTime: 30_000,
  });

  const categoryCount = useMemo(() => {
    const map: Record<string, number> = {};
    apps?.forEach(a => { map[a.category] = (map[a.category] ?? 0) + 1; });
    return map;
  }, [apps]);

  const filtered = useMemo(() => {
    if (!apps) return [];
    if (activeFilter === "TẤT CẢ") return apps;
    return apps.filter(a => a.category === activeFilter);
  }, [apps, activeFilter]);

  const activeCount = apps?.filter(a => a.status === "ACTIVE").length ?? 0;
  const totalCount  = apps?.length ?? 0;

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <BG />
      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 max-w-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ── Page header ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="relative">
                    <Rocket className="w-6 h-6 text-primary" />
                    <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-wider text-white uppercase neon-text">
                    App Launcher
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground/55 ml-0.5">
                  Khởi chạy bất kỳ ứng dụng nào trong Universe Ecosystem
                </p>
              </div>

              {/* Live stats */}
              {!isLoading && !isError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 text-[11px] font-mono shrink-0"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activeCount} ACTIVE
                  </div>
                  <div className="text-muted-foreground/30">
                    {totalCount} TOTAL
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* ── Category filter ───────────────────────────────────────────── */}
            {!isLoading && !isError && (apps?.length ?? 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="flex flex-wrap gap-2"
              >
                {ALL_CATS.filter(cat =>
                  cat === "TẤT CẢ" || (categoryCount[cat] ?? 0) > 0,
                ).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={cn(
                      "px-3 py-1 rounded-full border text-[10px] font-mono font-semibold tracking-widest uppercase transition-all duration-200",
                      activeFilter === cat
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/3 text-muted-foreground/45 hover:border-white/20 hover:text-white/60",
                    )}
                  >
                    {cat}
                    {cat !== "TẤT CẢ" && (
                      <span className="ml-1.5 opacity-50">{categoryCount[cat]}</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}

            {/* ── Grid / States ─────────────────────────────────────────────── */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : isError ? (
              <ErrorState
                message={(error as Error)?.message ?? "Lỗi không xác định"}
                onRetry={() => void refetch()}
              />
            ) : filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((app, i) => (
                  <AppCard key={app.id} app={app} index={i} />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
