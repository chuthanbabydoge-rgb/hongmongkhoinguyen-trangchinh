import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Settings, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function StudioSettings() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(14);
  const [autosave, setAutosave] = useState(true);
  const [autosaveInterval, setAutosaveInterval] = useState(30);

  const { data } = useQuery({
    queryKey: ["studio-prefs"],
    queryFn: async () => {
      const r = await fetch("/api/studio/preferences", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (data?.data) {
      const p = data.data as { theme: string; fontSize: number; autosave: boolean; autosaveInterval: number };
      setTheme(p.theme ?? "dark");
      setFontSize(p.fontSize ?? 14);
      setAutosave(p.autosave ?? true);
      setAutosaveInterval(p.autosaveInterval ?? 30);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await fetch("/api/studio/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ theme, fontSize, autosave, autosaveInterval }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["studio-prefs"] }),
  });

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3"><Settings className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-white">Studio Settings</h1></div>

      <div className="max-w-xl rounded-xl border border-white/10 bg-white/3 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Giao diện (Theme)</label>
          <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
            {["dark","light","monokai","solarized","github-dark"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">Cỡ chữ editor: <span className="text-primary">{fontSize}px</span></label>
          <input type="range" min={10} max={24} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
            className="w-full accent-primary" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Tự động lưu</p>
            <p className="text-xs text-muted-foreground">Lưu tài liệu tự động theo chu kỳ</p>
          </div>
          <button onClick={() => setAutosave(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors ${autosave ? "bg-primary" : "bg-white/10"}`}>
            <div className={`w-4 h-4 rounded-full bg-white m-1 transition-transform ${autosave ? "translate-x-4" : ""}`} />
          </button>
        </div>

        {autosave && (
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Chu kỳ lưu tự động: <span className="text-primary">{autosaveInterval}s</span></label>
            <input type="range" min={10} max={300} step={10} value={autosaveInterval} onChange={e => setAutosaveInterval(Number(e.target.value))}
              className="w-full accent-primary" />
          </div>
        )}

        <button onClick={() => save.mutate()} disabled={save.isPending}
          className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" /> Lưu cài đặt
        </button>
      </div>
    </div>
  );
}
