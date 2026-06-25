import { Mail, Gift, Inbox, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useMailDashboard } from "@/hooks/useMail";

export function MailOverviewCard() {
  const { data, isLoading } = useMailDashboard();

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-white/5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Chưa đọc",
      value: data?.unreadCount ?? 0,
      icon:  Inbox,
      color: "text-blue-400",
      glow:  "border-blue-400/20 bg-blue-400/5",
    },
    {
      label: "Phần thưởng",
      value: data?.claimableCount ?? 0,
      icon:  Gift,
      color: "text-yellow-400",
      glow:  "border-yellow-400/20 bg-yellow-400/5",
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-white text-sm">Hộp thư</h3>
        </div>
        <Link href="/mail">
          <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            Xem tất cả <ChevronRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-lg border p-3 flex flex-col gap-1", s.glow)}>
            <div className="flex items-center gap-2">
              <s.icon className={cn("w-4 h-4", s.color)} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <span className={cn("text-2xl font-bold font-mono", s.color)}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {data?.recentMails && data.recentMails.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Thư gần đây</p>
          {data.recentMails.slice(0, 3).map((mail) => (
            <Link key={mail.id} href="/mail">
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  mail.status === "UNREAD" ? "bg-primary" : "bg-white/10"
                )} />
                <p className={cn(
                  "text-xs flex-1 truncate",
                  mail.status === "UNREAD" ? "text-white font-medium" : "text-muted-foreground"
                )}>
                  {mail.subject}
                </p>
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 text-xs text-muted-foreground/40">
          Hộp thư trống
        </div>
      )}
    </div>
  );
}
