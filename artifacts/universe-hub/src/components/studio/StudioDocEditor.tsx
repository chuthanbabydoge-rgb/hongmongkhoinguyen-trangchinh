import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Plus, Save, Trash2, Copy, Send, FileText, ChevronRight } from "lucide-react";
import { useState, type ComponentType } from "react";

interface Props {
  type: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const DEFAULT_DOC_DATA = {
  WORLD:     { name: "New World", biome: "FOREST", size: "LARGE", maxPlayers: 50, pvp: false, weatherEnabled: true },
  NPC:       { name: "New NPC", role: "MERCHANT", level: 1, hp: 100, dialog: [], loot: [], faction: "NEUTRAL" },
  QUEST:     { name: "New Quest", type: "MAIN", objectives: [], rewards: [], minLevel: 1, maxLevel: 99 },
  BOSS:      { name: "New Boss", tier: 1, hp: 10000, phases: [], skills: [], respawnTime: 3600 },
  DUNGEON:   { name: "New Dungeon", difficulty: "NORMAL", rooms: [], bosses: [], lootTable: [], minParty: 1, maxParty: 5 },
  ITEM:      { name: "New Item", type: "EQUIPMENT", rarity: "COMMON", stats: {}, enchantable: true, tradeable: true },
  SKILL:     { name: "New Skill", type: "ACTIVE", element: "FIRE", baseDamage: 100, cooldown: 5, manaCost: 20 },
  PET:       { name: "New Pet", species: "WOLF", rarity: "COMMON", skills: [], evolutions: [], baseStats: {} },
  MOUNT:     { name: "New Mount", type: "LAND", speed: 150, skills: [], cosmetics: [] },
  BUILDING:  { name: "New Building", type: "HOUSE", rooms: [], utilities: [], capacity: 10 },
  CITY:      { name: "New City", population: 1000, districts: [], buildings: [], services: [] },
  SPORTS:    { name: "New Sports Entity", type: "TEAM", players: [], stats: {} },
  EDUCATION: { name: "New Course", category: "TECHNOLOGY", lessons: [], exams: [], certificate: true },
  COMPANY:   { name: "New Company", type: "CORPORATION", departments: [], products: [], employees: 0 },
  DIALOG:    { name: "New Dialog", nodes: [], edges: [], startNodeId: null },
};

export function StudioDocEditor({ type, label, icon: Icon, color, description }: Props) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [docName, setDocName] = useState("Tài liệu mới");
  const [editJson, setEditJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["studio-docs", type],
    queryFn: async () => {
      const r = await fetch(`/api/studio/docs/${type.toLowerCase()}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const create = useMutation({
    mutationFn: async () => {
      await fetch(`/api/studio/docs/${type.toLowerCase()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: docName, data: DEFAULT_DOC_DATA[type as keyof typeof DEFAULT_DOC_DATA] ?? {} }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-docs", type] }); setDocName("Tài liệu mới"); },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      let parsed: unknown;
      try { parsed = JSON.parse(editJson); setJsonError(""); } catch { setJsonError("JSON không hợp lệ"); return; }
      await fetch(`/api/studio/docs/${type.toLowerCase()}/${selected}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ data: parsed }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-docs", type] }),
  });

  const publish = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/studio/docs/${type.toLowerCase()}/${id}/publish`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-docs", type] }),
  });

  const clone = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/studio/docs/${type.toLowerCase()}/${id}/clone`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-docs", type] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/studio/docs/${type.toLowerCase()}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-docs", type] }); setSelected(null); setEditJson(""); },
  });

  const docs = (data?.data ?? []) as { id: string; name: string; version: number; isDraft: boolean; data: unknown }[];

  const selectDoc = (doc: { id: string; data: unknown }) => {
    setSelected(doc.id);
    setEditJson(JSON.stringify(doc.data, null, 2));
    setJsonError("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="border-b border-white/10 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <span className="font-bold text-white">{label}</span>
          <span className="text-xs text-muted-foreground ml-2">{description}</span>
        </div>
        <div className="flex-1" />
        <input value={docName} onChange={e => setDocName(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white w-44 focus:outline-none focus:border-primary/40" />
        <button onClick={() => create.mutate()} disabled={create.isPending}
          className="px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded text-sm flex items-center gap-1.5 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Tạo mới
        </button>
        {selected && (
          <>
            <button onClick={() => save.mutate()} disabled={save.isPending || !!jsonError}
              className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded text-sm flex items-center gap-1.5 disabled:opacity-50">
              <Save className="w-4 h-4" /> Lưu
            </button>
            <button onClick={() => publish.mutate(selected)}
              className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-sm flex items-center gap-1.5">
              <Send className="w-4 h-4" /> Publish
            </button>
          </>
        )}
      </div>

      {/* Body: 3-panel IDE layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel: doc list */}
        <div className="w-52 border-r border-white/10 flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Tài liệu ({docs.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {isLoading && <div className="px-3 py-2 text-xs text-muted-foreground animate-pulse">Đang tải...</div>}
            {!isLoading && docs.length === 0 && <div className="px-3 py-4 text-xs text-muted-foreground/50 text-center">Chưa có tài liệu</div>}
            {docs.map(doc => (
              <div key={doc.id} onClick={() => selectDoc(doc)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${selected === doc.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{doc.name}</div>
                  <div className="text-[10px] opacity-50">v{doc.version} · {doc.isDraft ? "Draft" : "Published"}</div>
                </div>
                <ChevronRight className="w-3 h-3 opacity-30" />
              </div>
            ))}
          </div>
        </div>

        {/* Center: JSON editor */}
        <div className="flex-1 flex flex-col min-h-0">
          {selected ? (
            <>
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-muted-foreground/50">data.json</span>
                {jsonError && <span className="text-xs text-rose-400">{jsonError}</span>}
              </div>
              <textarea value={editJson} onChange={e => { setEditJson(e.target.value); setJsonError(""); }}
                className="flex-1 bg-[#0d0d16] text-green-300 font-mono text-xs p-4 resize-none focus:outline-none border-0"
                spellCheck={false} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground/40">
              <div className="text-center">
                <Icon className={`w-16 h-16 mx-auto mb-4 opacity-20 ${color}`} />
                <p className="text-sm">Chọn tài liệu để chỉnh sửa</p>
                <p className="text-xs mt-1">hoặc tạo tài liệu mới</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Inspector */}
        <div className="w-52 border-l border-white/10 flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Inspector</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {selected ? (
              <>
                <div className="text-xs rounded-lg border border-white/5 p-3 bg-white/3 space-y-1">
                  <p className="font-medium text-white text-[11px]">Tài liệu</p>
                  <p className="text-muted-foreground/60">ID: <span className="font-mono">{selected.slice(0,8)}…</span></p>
                  <p className="text-muted-foreground/60">Type: {type}</p>
                </div>
                <div className="space-y-1.5">
                  <button onClick={() => clone.mutate(selected)}
                    className="w-full text-xs px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-muted-foreground hover:text-white flex items-center gap-2">
                    <Copy className="w-3 h-3" /> Clone
                  </button>
                  <button onClick={() => del.mutate(selected)}
                    className="w-full text-xs px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded text-rose-400 flex items-center gap-2">
                    <Trash2 className="w-3 h-3" /> Xóa
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground/40 text-center pt-4">Chưa có gì được chọn</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
