import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, ScrollText } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Props { params: { id: string } }

const ACTION_LABEL: Record<string, string> = {
  GUILD_CREATED: "Tạo guild",
  MEMBER_JOINED: "Thành viên tham gia",
  MEMBER_LEFT: "Thành viên rời guild",
  MEMBER_KICKED: "Kick thành viên",
  MEMBER_INVITED: "Gửi lời mời",
  INVITE_ACCEPTED: "Chấp nhận lời mời",
  INVITE_DECLINED: "Từ chối lời mời",
  JOIN_REQUEST_SENT: "Gửi yêu cầu tham gia",
  JOIN_REQUEST_APPROVED: "Chấp thuận yêu cầu",
  JOIN_REQUEST_REJECTED: "Từ chối yêu cầu",
  ROLE_CHANGED: "Thay đổi vai trò",
  ANNOUNCEMENT_POSTED: "Đăng thông báo",
  EVENT_CREATED: "Tạo sự kiện",
  EVENT_JOINED: "Tham gia sự kiện",
  TREASURY_DEPOSIT: "Nạp kho bạc",
  TREASURY_WITHDRAW: "Rút kho bạc",
  WAREHOUSE_DEPOSIT: "Nạp kho đồ",
  WAREHOUSE_WITHDRAW: "Rút kho đồ",
  GUILD_UPDATED: "Cập nhật guild",
};

export default function GuildLogs({ params }: Props) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { data: guild } = useQuery({ queryKey: ["guild", id], queryFn: () => guildService.getGuild(id) });
  const { data: logs = [], isLoading, error } = useQuery({ queryKey: ["guild-logs", id], queryFn: () => guildService.getLogs(id) });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => navigate(`/guild/${id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> {guild?.name ?? "Guild"}
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><ScrollText className="w-5 h-5 text-primary" /> Nhật Ký Guild</h1>

            {isLoading ? (
              <div className="space-y-2">{Array.from({length:8}).map((_,i) => <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />)}</div>
            ) : error ? (
              <div className="text-center py-12 text-red-400"><p>Không có quyền xem nhật ký.</p></div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><ScrollText className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Chưa có nhật ký.</p></div>
            ) : (
              <div className="space-y-1">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-white/5 last:border-0 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white font-medium">{ACTION_LABEL[log.action] ?? log.action}</span>
                        {log.targetId && <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground truncate max-w-[120px]">{log.targetId}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Actor: <span className="font-mono">{log.actorId}</span> · {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
