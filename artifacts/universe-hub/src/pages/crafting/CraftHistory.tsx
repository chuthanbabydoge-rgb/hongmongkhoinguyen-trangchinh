import { useState } from "react";
import { History, CheckCircle2, XCircle, Clock, Hammer } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { useCraftHistory as useHistory } from "@/hooks/useCrafting";

const STATUS_LABELS: Record<string, string> = {
  FINISHED:  "Hoàn thành",
  CANCELLED: "Đã huỷ",
  FAILED:    "Thất bại",
  CRAFTING:  "Đang chế tạo",
  PENDING:   "Chờ xử lý",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  FINISHED:  { color: "bg-green-500/20 text-green-400 border-green-500/30",   icon: <CheckCircle2 className="w-4 h-4" /> },
  CANCELLED: { color: "bg-red-500/20 text-red-400 border-red-500/30",         icon: <XCircle className="w-4 h-4" /> },
  FAILED:    { color: "bg-red-500/20 text-red-400 border-red-500/30",         icon: <XCircle className="w-4 h-4" /> },
  CRAFTING:  { color: "bg-blue-500/20 text-blue-400 border-blue-500/30",      icon: <Hammer className="w-4 h-4" /> },
  PENDING:   { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-4 h-4" /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN");
}

function duration(start: string, end: string | null) {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m`;
}

export default function CraftHistory() {
  const [limit, setLimit] = useState(20);
  const { data: history = [], isLoading, refetch } = useHistory();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Lịch sử chế tạo</h1>
                <p className="text-sm text-muted-foreground">{(history as any[]).length} công việc gần đây</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Làm mới
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
              Đang tải...
            </div>
          ) : (history as any[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground space-y-3">
              <History className="w-12 h-12 opacity-30" />
              <p className="text-lg font-medium">Chưa có lịch sử chế tạo</p>
              <p className="text-sm">Bắt đầu chế tạo để xem lịch sử tại đây</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(history as any[]).map((job) => {
                const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG["PENDING"]!;
                return (
                  <div
                    key={job.id}
                    className="border border-border/50 rounded-xl p-4 bg-card/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Hammer className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {job.recipeName ?? `Recipe #${job.recipeId?.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bắt đầu: {formatDate(job.startedAt ?? job.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Thời gian</p>
                          <p className="text-sm font-medium">
                            {duration(job.startedAt ?? job.createdAt, job.finishedAt)}
                          </p>
                        </div>
                        <Badge className={`${cfg.color} flex items-center gap-1 border`}>
                          {cfg.icon}
                          {STATUS_LABELS[job.status] ?? job.status}
                        </Badge>
                      </div>
                    </div>

                    {job.outputItems && (job.outputItems as any[]).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-2">
                        {(job.outputItems as any[]).map((item: any, idx: number) => (
                          <span key={idx} className="text-xs bg-muted/50 rounded-md px-2 py-1 text-muted-foreground">
                            {item.itemType ?? item.resourceType} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {(history as any[]).length >= limit && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setLimit(l => l + 20)}>
                Tải thêm
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
