import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, FolderOpen, Wand2, Package, Puzzle, FileText, History, HardDrive, BookTemplate, Cpu } from "lucide-react";

export default function StudioDashboard() {
  const { accessToken } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["studio-dashboard"],
    queryFn: async () => {
      const r = await fetch("/api/studio/dashboard", { headers: { Authorization: `Bearer ${accessToken}` } });
      return r.json();
    },
    enabled: !!accessToken,
  });

  const stats = data?.data;

  const cards = [
    { icon: FolderOpen,    label: "Editors",    value: stats?.editors   ?? 0, color: "text-blue-400",   bg: "bg-blue-400/10"   },
    { icon: FileText,      label: "Documents",  value: stats?.totalDocs ?? 0, color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: Package,       label: "Assets",     value: stats?.assets    ?? 0, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { icon: BookTemplate,  label: "Templates",  value: stats?.templates ?? 0, color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
    { icon: Package,       label: "Packages",   value: stats?.packages  ?? 0, color: "text-green-400",  bg: "bg-green-400/10"  },
    { icon: Puzzle,        label: "Plugins",    value: stats?.plugins   ?? 0, color: "text-pink-400",   bg: "bg-pink-400/10"   },
    { icon: HardDrive,     label: "Backups",    value: stats?.backups   ?? 0, color: "text-orange-400", bg: "bg-orange-400/10" },
    { icon: Cpu,           label: "Visual Scripts", value: 0, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  ];

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wand2 className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-white">Creator Studio</h1>
          <p className="text-muted-foreground text-sm">IDE cho Universe — tạo thế giới, NPC, quest, boss và mọi thứ</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-xl border border-white/10 p-4 ${c.bg} flex flex-col gap-2`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
              <div className="text-2xl font-bold text-white">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-primary" />
            <span className="font-semibold text-white text-sm">Hoạt động gần đây</span>
          </div>
          {stats?.recentActivity?.length ? (
            <ul className="space-y-2">
              {(stats.recentActivity as { id: string; action: string; docId: string; createdAt: string }[]).map((h) => (
                <li key={h.id} className="flex items-center justify-between text-xs text-muted-foreground border-b border-white/5 pb-2">
                  <span className="text-white font-mono">{h.action}</span>
                  <span className="font-mono text-[10px]">{new Date(h.createdAt).toLocaleDateString("vi")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Chưa có hoạt động nào.</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/3 p-5">
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <span className="font-semibold text-white text-sm">Truy cập nhanh</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "World Editor",    path: "/studio/world-editor"  },
              { label: "NPC Editor",      path: "/studio/npc-editor"    },
              { label: "Quest Editor",    path: "/studio/quest-editor"  },
              { label: "Visual Scripts",  path: "/studio/visual-script" },
              { label: "Template Browser",path: "/studio/templates"     },
              { label: "Asset Browser",   path: "/studio/assets"        },
            ].map((item) => (
              <a key={item.label} href={item.path}
                className="text-xs bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 text-muted-foreground hover:text-white transition-colors border border-white/5">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
