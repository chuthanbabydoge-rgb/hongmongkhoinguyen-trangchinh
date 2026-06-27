import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Send, RefreshCw, Trash2, CheckCircle, XCircle, Clock, Loader } from "lucide-react";

const STATUS_ICONS: Record<string, { icon: typeof CheckCircle; color: string }> = {
  DONE:       { icon: CheckCircle, color: "text-green-400" },
  FAILED:     { icon: XCircle,     color: "text-red-400"   },
  PENDING:    { icon: Clock,       color: "text-yellow-400"},
  PUBLISHING: { icon: Loader,      color: "text-blue-400"  },
  VALIDATING: { icon: Loader,      color: "text-cyan-400"  },
  PACKAGING:  { icon: Loader,      color: "text-purple-400"},
};

export default function PublishCenter() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["studio-jobs"],
    queryFn: async () => {
      const r = await fetch("/api/studio/publish/jobs", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
    refetchInterval: 5000,
  });

  const retry = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/studio/publish/jobs/${id}/retry`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-jobs"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/publish/jobs/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-jobs"] }),
  });

  const jobs = (data?.data ?? []) as { id: string; status: string; docType?: string; version: string; createdAt: string; completedAt?: string; logs: { msg: string }[] }[];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Send className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-white">Publish Center</h1>
          <p className="text-muted-foreground text-sm">Quản lý pipeline publish tài liệu — auto-refresh mỗi 5s</p>
        </div>
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse"/>)}</div> :
        jobs.length === 0 ? <div className="text-center py-16 text-muted-foreground"><Send className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Chưa có publish job nào. Publish tài liệu từ các Editor.</p></div> :
        <div className="space-y-3">
          {jobs.map(j => {
            const si = STATUS_ICONS[j.status] ?? STATUS_ICONS["PENDING"]!;
            return (
              <div key={j.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
                <div className="flex items-center gap-3">
                  <si.icon className={`w-5 h-5 ${si.color} ${j.status !== "DONE" && j.status !== "FAILED" ? "animate-spin" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{j.docType ?? "Doc"}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${si.color} bg-white/5`}>{j.status}</span>
                      <span className="text-xs text-muted-foreground/50">v{j.version}</span>
                    </div>
                    {j.logs.length > 0 && <p className="text-xs text-muted-foreground mt-1">{j.logs[j.logs.length-1]?.msg}</p>}
                    <p className="text-[10px] text-muted-foreground/40 mt-1">{new Date(j.createdAt).toLocaleString("vi")}</p>
                  </div>
                  {j.status === "FAILED" && (
                    <button onClick={() => retry.mutate(j.id)} className="text-yellow-400 hover:bg-yellow-400/10 p-1.5 rounded"><RefreshCw className="w-4 h-4"/></button>
                  )}
                  <button onClick={() => del.mutate(j.id)} className="text-rose-400/60 hover:text-rose-400 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
