import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Cpu, Plus, Save, Trash2, Play, GitBranch } from "lucide-react";
import { useState } from "react";

const DEFAULT_NODES = [
  { id: "start",    type: "START",    label: "Start",        x: 100, y: 200, color: "#22c55e" },
  { id: "if-1",     type: "IF",       label: "If Condition", x: 280, y: 200, color: "#f59e0b" },
  { id: "spawn-1",  type: "ACTION",   label: "Spawn NPC",    x: 460, y: 140, color: "#6366f1" },
  { id: "quest-1",  type: "ACTION",   label: "Give Quest",   x: 460, y: 260, color: "#6366f1" },
  { id: "reward-1", type: "ACTION",   label: "Give Reward",  x: 640, y: 200, color: "#ec4899" },
  { id: "end",      type: "END",      label: "Finish",       x: 820, y: 200, color: "#ef4444" },
];

export default function VisualScriptEditor() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [scriptName, setScriptName] = useState("Script mới");
  const [selected, setSelected] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["studio-scripts"],
    queryFn: async () => {
      const r = await fetch("/api/studio/scripts", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const createScript = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: scriptName, nodes: DEFAULT_NODES, edges: [] }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-scripts"] }),
  });

  const scripts = (data?.data ?? []) as { id: string; name: string; version: number }[];

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-white/10 px-6 py-3 flex items-center gap-4">
        <Cpu className="w-5 h-5 text-primary" />
        <span className="font-bold text-white">Visual Script Editor</span>
        <div className="flex-1" />
        <input value={scriptName} onChange={e => setScriptName(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white w-48 focus:outline-none" />
        <button onClick={() => createScript.mutate()}
          className="px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Tạo Script
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Scripts panel */}
        <div className="w-56 border-r border-white/10 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">Scripts</p>
          {scripts.map((s) => (
            <div key={s.id} onClick={() => setSelected(s.id)}
              className={`px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${selected === s.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
              <div className="font-medium truncate">{s.name}</div>
              <div className="text-[10px] opacity-50">v{s.version}</div>
            </div>
          ))}
          {scripts.length === 0 && <p className="text-xs text-muted-foreground/50 text-center pt-4">Chưa có script</p>}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-[#0a0a12] overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-muted-foreground/50 font-mono">
            <GitBranch className="w-3 h-3" />
            <span>Visual Script Canvas — kéo thả nodes để tạo logic flow</span>
          </div>

          {DEFAULT_NODES.map((node, i) => (
            <div key={node.id} className="absolute flex flex-col items-center gap-1 cursor-grab"
              style={{ left: node.x, top: node.y - 30 }}>
              {i > 0 && (
                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-8 h-px"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              )}
              <div className="rounded-lg border px-3 py-2 text-xs font-mono font-bold text-white shadow-lg"
                style={{ borderColor: node.color, backgroundColor: `${node.color}20`, color: node.color }}>
                {node.label}
              </div>
              <div className="text-[9px] text-muted-foreground/40">{node.type}</div>
            </div>
          ))}

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-muted-foreground flex items-center gap-1">
              <Save className="w-3 h-3" /> Lưu
            </button>
            <button className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 flex items-center gap-1">
              <Play className="w-3 h-3" /> Chạy
            </button>
          </div>
        </div>

        {/* Inspector */}
        <div className="w-56 border-l border-white/10 p-3">
          <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-3">Inspector</p>
          <div className="space-y-3">
            {DEFAULT_NODES.map((n) => (
              <div key={n.id} className="text-xs rounded-lg border border-white/5 p-2 bg-white/3">
                <div className="font-medium text-white">{n.label}</div>
                <div className="text-muted-foreground/50 mt-0.5">Type: {n.type}</div>
                <div className="text-muted-foreground/50">ID: {n.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
