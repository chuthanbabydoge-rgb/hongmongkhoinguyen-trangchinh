import { useAccount } from "@/hooks/useAccount";
import {
  Shield,
  Zap,
  Star,
  BadgeCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Reputation tier config ───────────────────────────────────────────────────

const TIER_META = {
  bronze:   { label: "Đồng",      color: "text-amber-700",  glow: "shadow-[0_0_12px_rgba(180,83,9,0.4)]",  ring: "border-amber-700/50"  },
  silver:   { label: "Bạc",       color: "text-slate-300",  glow: "shadow-[0_0_12px_rgba(203,213,225,0.4)]",ring: "border-slate-300/50"  },
  gold:     { label: "Vàng",      color: "text-amber-400",  glow: "shadow-[0_0_16px_rgba(251,191,36,0.4)]", ring: "border-amber-400/50"  },
  platinum: { label: "Bạch kim",  color: "text-cyan-300",   glow: "shadow-[0_0_18px_rgba(103,232,249,0.4)]",ring: "border-cyan-300/50"   },
  diamond:  { label: "Kim cương", color: "text-violet-400", glow: "shadow-[0_0_20px_rgba(167,139,250,0.5)]",ring: "border-violet-400/50" },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className ?? ""}`} />;
}

function StatPill({
  icon: Icon,
  label,
  value,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-2">
      <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono leading-none mb-0.5">
          {label}
        </div>
        <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface UniverseIdentityCardProps {
  className?: string;
}

export function UniverseIdentityCard({ className = "" }: UniverseIdentityCardProps) {
  const { profile, avatar, level, reputation, loading, error } = useAccount();

  const tierMeta = reputation ? TIER_META[reputation.tier] : null;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl",
        "bg-black/40 backdrop-blur-xl",
        "border border-white/10",
        "shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "w-full max-w-sm",
        className,
      ].join(" ")}
    >
      {/* ── Decorative glow blobs ── */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-violet-600/10 blur-2xl" />

      {/* ── Top accent line ── */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative z-10 p-6 space-y-5">

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-mono py-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && !error && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          </div>
        )}

        {/* ── Loaded ── */}
        {!loading && !error && profile && level && (
          <>
            {/* Avatar + Identity */}
            <div className="flex items-center gap-4">
              {/* Avatar ring */}
              <div
                className={[
                  "relative shrink-0 rounded-full p-[2px]",
                  "bg-gradient-to-br from-primary/70 via-violet-600/60 to-transparent",
                  tierMeta ? tierMeta.glow : "",
                ].join(" ")}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  {avatar?.imageUrl ? (
                    <img
                      src={avatar.imageUrl}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/80 to-violet-600/80 flex items-center justify-center text-xl font-bold text-white">
                      {avatar?.initials ?? profile.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Level badge */}
                <div className="absolute -bottom-1 -right-1 bg-black border border-primary/60 text-primary text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md leading-none">
                  LV{level.current}
                </div>
              </div>

              {/* Name & title */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-white font-bold text-base uppercase tracking-wider leading-tight truncate">
                    {profile.username}
                  </h3>
                  {/* Verified badge */}
                  <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-primary/80 font-mono uppercase tracking-widest">
                  <Shield className="w-3 h-3 shrink-0" />
                  <span className="truncate">{profile.title}</span>
                </div>
                {/* Online status */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className={[
                      "w-1.5 h-1.5 rounded-full",
                      profile.status === "online"
                        ? "bg-emerald-400 animate-pulse"
                        : profile.status === "away"
                          ? "bg-amber-400"
                          : "bg-slate-500",
                    ].join(" ")}
                  />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    {profile.status === "online"
                      ? "Trực tuyến"
                      : profile.status === "away"
                        ? "Vắng mặt"
                        : "Ngoại tuyến"}
                  </span>
                </div>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1 text-primary/70">
                  <Zap className="w-3 h-3" /> Kinh nghiệm
                </span>
                <span className="text-white/70">
                  {level.xp.toLocaleString()} / {level.maxXp.toLocaleString()} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 border border-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-all duration-700"
                  style={{ width: `${level.progressPercent}%` }}
                />
              </div>
              <div className="text-right text-[10px] text-muted-foreground font-mono">
                {level.progressPercent}%
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2">
              <StatPill
                icon={Star}
                label="Cấp độ"
                value={level.rank}
                color="text-blue-400"
              />
              {reputation && (
                <StatPill
                  icon={Shield}
                  label="Uy tín"
                  value={reputation.score}
                  color={tierMeta?.color ?? "text-amber-400"}
                />
              )}
            </div>

            {/* Reputation tier badge */}
            {reputation && tierMeta && (
              <div
                className={[
                  "flex items-center justify-between",
                  "rounded-xl px-4 py-2.5",
                  "bg-white/4 border",
                  tierMeta.ring,
                ].join(" ")}
              >
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  Hạng danh tiếng
                </div>
                <div className={`text-sm font-bold font-mono uppercase ${tierMeta.color}`}>
                  {tierMeta.label}
                </div>
              </div>
            )}

            {/* Bottom accent */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Verification line */}
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              <span>ID: {profile.id}</span>
              <span className="flex items-center gap-1 text-primary/60">
                <BadgeCheck className="w-3 h-3" /> Đã xác minh
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Bottom accent line ── */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
