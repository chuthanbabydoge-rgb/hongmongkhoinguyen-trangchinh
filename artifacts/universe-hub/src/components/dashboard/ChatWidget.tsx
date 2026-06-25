import { MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useChatDashboard, getRoomTypeIcon, formatMessageTime } from "@/hooks/useChat";

export function ChatWidget() {
  const { data, isLoading } = useChatDashboard();

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-white/5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-white text-sm">Universe Chat</h3>
        </div>
        <Link href="/chat">
          <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            Mở chat <ChevronRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-blue-400/20 bg-blue-400/5 p-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Phòng chat</span>
          </div>
          <span className="text-2xl font-bold font-mono text-blue-400">{data?.roomCount ?? 0}</span>
        </div>
        <div className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-xs text-muted-foreground">Chưa đọc</span>
          </div>
          <span className="text-2xl font-bold font-mono text-rose-400">{data?.totalUnread ?? 0}</span>
        </div>
      </div>

      {data?.recentRooms && data.recentRooms.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Phòng gần đây</p>
          {data.recentRooms.slice(0, 3).map((room) => (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                <span className="text-base flex-shrink-0">{room.icon ?? getRoomTypeIcon(room.type)}</span>
                <p className={cn(
                  "text-xs flex-1 truncate",
                  (room.unreadCount ?? 0) > 0 ? "text-white font-medium" : "text-muted-foreground"
                )}>
                  {room.name}
                </p>
                {(room.unreadCount ?? 0) > 0 && (
                  <span className="min-w-[16px] h-4 rounded-full bg-rose-400/20 border border-rose-400/30 text-rose-400 text-[9px] font-mono font-bold flex items-center justify-center px-1">
                    {room.unreadCount}
                  </span>
                )}
                {room.lastMessageAt && (
                  <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">{formatMessageTime(room.lastMessageAt)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 text-xs text-muted-foreground/40">
          Chưa có phòng chat nào
        </div>
      )}
    </div>
  );
}
