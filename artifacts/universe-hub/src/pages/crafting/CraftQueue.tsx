import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { useCraftJobs, useCompleteCraft, useCancelCraft } from "@/hooks/useCrafting";

const STATUS_LABELS: Record<string, string> = {
  CRAFTING: "Đang chế tạo", FINISHED: "Hoàn thành", CANCELLED: "Đã huỷ", PENDING: "Chờ xử lý", FAILED: "Thất bại",
};
const STATUS_COLORS: Record<string, string> = {
  CRAFTING:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  FINISHED:  "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  PENDING:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FAILED:    "bg-red-500/20 text-red-400 border-red-500/30",
};

function timeLeft(finishesAt: string): string {
  const diff = new Date(finishesAt).getTime() - Date.now();
  if (diff <= 0) return "Xong rồi!";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s còn lại`;
  return `${Math.floor(s / 60)}m ${s % 60}s còn lại`;
}

export default function CraftQueue() {
  const { data: jobs = [], isLoading } = useCraftJobs();
  const complete = useCompleteCraft();
  const cancel   = useCancelCraft();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⏳</div>
            <div>
              <h1 className="text-xl font-bold text-white">Hàng đợi chế tạo</h1>
              <p className="text-sm text-muted-foreground">{(jobs as any[]).length} công việc</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Đang tải...</div>
          ) : (jobs as any[]).length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Không có công việc chế tạo nào</div>
          ) : (
            <div className="space-y-3">
              {(jobs as any[]).map(job => {
                const isReady = job.status === "CRAFTING" && new Date(job.finishesAt) <= new Date();
                return (
                  <div key={job.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-2xl">⚒️</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Job #{job.id.slice(-8)}</div>
                      <div className="text-xs text-muted-foreground">Recipe: {job.recipeId.slice(-8)}</div>
                      {job.status === "CRAFTING" && (
                        <div className="text-xs text-blue-400 mt-1">{timeLeft(job.finishesAt)}</div>
                      )}
                    </div>
                    <Badge className={STATUS_COLORS[job.status] ?? "bg-white/10 text-white border-white/20"}>
                      {STATUS_LABELS[job.status] ?? job.status}
                    </Badge>
                    <div className="flex gap-2">
                      {(job.status === "CRAFTING" || isReady) && (
                        <Button size="sm" className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                          disabled={complete.isPending}
                          onClick={() => complete.mutate(job.id)}>
                          Hoàn thành
                        </Button>
                      )}
                      {job.status === "CRAFTING" && (
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300"
                          disabled={cancel.isPending}
                          onClick={() => cancel.mutate(job.id)}>
                          Huỷ
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
