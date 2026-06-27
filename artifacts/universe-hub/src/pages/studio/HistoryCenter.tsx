import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { History, Trash2, RotateCcw } from "lucide-react";

export default function HistoryCenter() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["studio-history"],
    queryFn: async () => {
      const r = await fetch("/api/studio/history", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await fetch(`/api/studio/history/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-history"] }),
  });

  const history = (data?.data ?? []) as { id: string; action: string; docId: string; docType?: string; createdAt: string }[];

  const ACTION_COLORS: Record<string, string> = {
    CREATE: "text-green-400", UPDATE: "text-blue-400", DELETE: "text-red-400",
    PUBLISH: "text-purple-400", CLONE: "text-yellow-400", RESTORE: "text-cyan-400", IMPORT: "text-orange-400",
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3"><History className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-white">History Center</h1></div>

      {isLoading ? <div className="space-y-2">{Array.from({length:8}).map((_,i)=><div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse"/>)}</div> :
        history.length === 0 ? <div className="text-center py-16 text-muted-foreground"><History className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>Chưa có lịch sử</p></div> :
        <div className="space-y-2">
          {history.map(h => (
            <div key={h.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-4 py-3">
              <RotateCcw className="w-4 h-4 text-muted-foreground/40" />
              <span className={`text-xs font-mono font-bold w-16 ${ACTION_COLORS[h.action] ?? "text-muted-foreground"}`}>{h.action}</span>
              <span className="text-xs text-muted-foreground/50 font-mono w-20">{h.docType ?? "—"}</span>
              <span className="text-xs text-muted-foreground font-mono flex-1 truncate">{h.docId}</span>
              <span className="text-[10px] text-muted-foreground/40">{new Date(h.createdAt).toLocaleString("vi")}</span>
              <button onClick={() => del.mutate(h.id)} className="text-rose-400/50 hover:text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
