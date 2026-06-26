import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BookTemplate, Loader2, Star } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string; name: string; description?: string; type: string;
  tags?: string[]; isOfficial: boolean; useCount: number; thumbnail?: string;
}

const TYPE_ICONS: Record<string, string> = {
  WORLD: "🌍", NPC: "🤖", QUEST: "📜", BUSINESS: "🏪", STORY: "📖",
  EVENT: "🎪", TOURNAMENT: "🏆", SHOP: "🛒", GUILD: "⚔️", DUNGEON: "🏰",
};

export default function CreatorTemplates() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<{ ok: boolean; data: Template[] }>({
    queryKey: ["creator", "templates"],
    queryFn: async () => {
      const res = await fetch("/api/creator/projects/templates");
      return res.json() as Promise<{ ok: boolean; data: Template[] }>;
    },
  });

  const createFromTemplate = useMutation({
    mutationFn: async (tpl: Template) => {
      const res = await fetch("/api/creator/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          name:       `${tpl.name} (Copy)`,
          description: tpl.description,
          type:       tpl.type,
          templateId: tpl.id,
          tags:       tpl.tags ?? [],
          content:    {},
        }),
      });
      return res.json() as Promise<{ ok: boolean; data: { id: string }; error?: string }>;
    },
    onSuccess: (data) => {
      if (data.ok) {
        qc.invalidateQueries({ queryKey: ["creator"] });
        toast({ title: "Project từ template đã tạo!" });
        navigate(`/creator/projects/${data.data.id}`);
      } else {
        toast({ title: data.error ?? "Lỗi", variant: "destructive" });
      }
    },
  });

  const templates = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookTemplate className="w-6 h-6 text-primary" />Templates
            </h1>

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16">
                <BookTemplate className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Chưa có template nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(t => (
                  <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{TYPE_ICONS[t.type] ?? "🎨"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-white truncate">{t.name}</p>
                          {t.isOfficial && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{t.type}</p>
                      </div>
                    </div>
                    {t.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                    )}
                    {t.tags && t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                      <span className="text-xs text-muted-foreground">Dùng {t.useCount} lần</span>
                      <Button size="sm" onClick={() => createFromTemplate.mutate(t)}
                        disabled={createFromTemplate.isPending}>
                        Dùng Template
                      </Button>
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
