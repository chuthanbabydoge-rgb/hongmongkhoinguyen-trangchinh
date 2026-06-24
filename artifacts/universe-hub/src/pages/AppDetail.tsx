import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { fetchApps, type EcosystemApp, type AppStatus } from "@/services/appRegistryService";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ExternalLink, AlertTriangle, RefreshCw,
  Zap, Shield, Globe, Users, Brain, TrendingUp, Box, Layers, Rocket,
} from "lucide-react";

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

const STATUS_META: Record<AppStatus, { label: string; cls: string; dot: string }> = {
  ACTIVE:      { label: "Active",      cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400", dot: "bg-emerald-400" },
  MAINTENANCE: { label: "Maintenance", cls: "bg-amber-500/10  border-amber-500/25  text-amber-400",   dot: "bg-amber-400"   },
  INACTIVE:    { label: "Inactive",    cls: "bg-slate-500/10  border-slate-500/25  text-slate-400",   dot: "bg-slate-400"   },
};

function AppIcon({ app }: { app: EcosystemApp }) {
  const FallbackIcon = CATEGORY_ICON[app.category] ?? Zap;
  const [imgErr, setImgErr] = React.useState(false);

  if (app.icon && !imgErr) {
    return (
      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center">
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
    <div className="w-20 h-20 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-center">
      <FallbackIcon className="w-10 h-10 text-primary/70" />
    </div>
  );
}

import React from "react";

export default function AppDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const { data: apps, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["apps"],
    queryFn: fetchApps,
    staleTime: 30_000,
  });

  const app = apps?.find(a => a.slug === slug);

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
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
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 max-w-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            <button
              onClick={() => navigate("/launcher")}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại Launcher
            </button>

            {isLoading && (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-8 animate-pulse space-y-4">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/8" />
                  <div className="space-y-2 flex-1">
                    <div className="h-6 w-1/2 rounded bg-white/8" />
                    <div className="h-4 w-1/3 rounded bg-white/5" />
                  </div>
                </div>
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-3/4 rounded bg-white/5" />
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                <div className="w-16 h-16 rounded-full border border-rose-500/25 bg-rose-500/5 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Không thể tải thông tin ứng dụng</p>
                  <p className="text-xs text-muted-foreground/60">{(error as Error)?.message}</p>
                </div>
                <button
                  onClick={() => void refetch()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Thử lại
                </button>
              </div>
            )}

            {!isLoading && !isError && !app && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-full border border-white/10 bg-white/3 flex items-center justify-center">
                  <Rocket className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground/50">
                  Không tìm thấy ứng dụng <span className="font-mono text-white/40">"{slug}"</span>
                </p>
              </div>
            )}

            {!isLoading && !isError && app && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <AppIcon app={app} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <h1 className="text-2xl font-bold text-white tracking-wide">{app.name}</h1>
                      {(() => {
                        const m = STATUS_META[app.status] ?? STATUS_META.INACTIVE;
                        return (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold tracking-wider uppercase",
                            m.cls,
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", m.dot, app.status === "ACTIVE" && "animate-pulse")} />
                            {m.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed">{app.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Phiên bản",  value: `v${app.version}` },
                    { label: "Danh mục",   value: app.category },
                    { label: "Slug",       value: app.slug },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-white/5 bg-white/2 px-4 py-3">
                      <p className="text-[10px] font-mono text-muted-foreground/35 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm font-semibold font-mono text-white/80">{value}</p>
                    </div>
                  ))}
                </div>

                {app.url && (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mở ứng dụng
                  </a>
                )}
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
