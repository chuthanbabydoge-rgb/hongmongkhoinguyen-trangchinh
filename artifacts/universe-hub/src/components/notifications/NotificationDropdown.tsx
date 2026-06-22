import { useRef, useState, useEffect } from "react";
import {
  Bell,
  Gift,
  ArrowLeftRight,
  Settings,
  Users,
  ShoppingBag,
  Circle,
  X,
  CheckCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import { type Notification, type NotificationType } from "@/services/accountService";

// ─── Category config ──────────────────────────────────────────────────────────

const TYPE_META: Record<
  NotificationType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  reward:      { label: "Phần thưởng",  icon: Gift,           color: "text-amber-400",   bg: "bg-amber-400/10"   },
  transaction: { label: "Giao dịch",    icon: ArrowLeftRight, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  system:      { label: "Hệ thống",     icon: Settings,       color: "text-slate-400",   bg: "bg-slate-400/10"   },
  social:      { label: "Xã hội",       icon: Users,          color: "text-blue-400",    bg: "bg-blue-400/10"    },
  marketplace: { label: "Chợ",          icon: ShoppingBag,    color: "text-violet-400",  bg: "bg-violet-400/10"  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}ph trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}g trước`;
  return `${Math.floor(diff / 86400)}ng trước`;
}

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationItem({ item }: { item: Notification }) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <div
      className={[
        "flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer",
        "hover:bg-white/5 active:bg-white/8",
        !item.isRead ? "border-l-2 border-primary" : "border-l-2 border-transparent",
      ].join(" ")}
    >
      {/* Category icon */}
      <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${meta.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug truncate ${!item.isRead ? "text-white" : "text-white/70"}`}>
            {item.title}
          </p>
          {!item.isRead && (
            <Circle className="w-1.5 h-1.5 fill-primary text-primary shrink-0 mt-1" />
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/70 leading-snug line-clamp-2 mt-0.5">
          {item.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[9px] uppercase tracking-widest font-mono ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[9px] text-muted-foreground/50 font-mono">
            {timeAgo(item.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main dropdown ────────────────────────────────────────────────────────────

export function NotificationDropdown() {
  const { notifications, unreadCount, loading, error } = useAccount();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      {/* ── Bell trigger ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
          open
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-primary hover:bg-white/5",
        ].join(" ")}
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-black font-mono leading-none px-0.5 shadow-[0_0_8px_hsl(var(--primary)/0.8)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className={[
            "absolute right-0 top-[calc(100%+8px)] w-80 z-50",
            "bg-black/80 backdrop-blur-2xl",
            "border border-white/10 rounded-xl overflow-hidden",
            "shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]",
            "animate-in fade-in slide-in-from-top-2 duration-150",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                Thông báo
              </span>
              {unreadCount > 0 && (
                <span className="bg-primary/20 text-primary text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-primary transition-colors font-mono uppercase tracking-wider px-1.5 py-1 rounded">
                  <CheckCheck className="w-3 h-3" />
                  Đọc tất cả
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground/60 hover:text-white transition-colors p-1 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[340px] overflow-y-auto scrollbar-thin">
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Đang tải...</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="flex items-center gap-2 px-4 py-6 text-red-400/80 text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && notifications.length === 0 && (
              <div className="py-10 text-center text-muted-foreground/40 text-xs font-mono uppercase tracking-widest">
                Không có thông báo
              </div>
            )}

            {/* List */}
            {!loading && !error && notifications.map((n, i) => (
              <div key={n.id}>
                {i > 0 && <div className="h-[1px] mx-4 bg-white/5" />}
                <NotificationItem item={n} />
              </div>
            ))}
          </div>

          {/* Footer */}
          {!loading && notifications.length > 0 && (
            <div className="border-t border-white/8 px-4 py-2.5">
              <button className="w-full text-center text-[10px] text-primary/70 hover:text-primary transition-colors font-mono uppercase tracking-widest py-0.5">
                Xem tất cả thông báo →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
