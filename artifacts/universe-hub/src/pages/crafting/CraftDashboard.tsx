import { Link } from "wouter";
import { Hammer, Package, BookOpen, Zap, Clock, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { Badge }   from "@/components/ui/badge";
import { Button }  from "@/components/ui/button";
import { useRecipes, useCraftJobs, useBlueprints, useStations } from "@/hooks/useCrafting";

const CATEGORY_ICONS: Record<string, string> = {
  METAL: "⚙️", WOOD: "🪵", FOOD: "🍞", MAGIC: "✨",
  JEWELRY: "💍", ALCHEMY: "🧪", GENERAL: "📦",
};
const STATUS_COLORS: Record<string, string> = {
  CRAFTING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  FINISHED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function timeLeft(finishesAt: string): string {
  const diff = new Date(finishesAt).getTime() - Date.now();
  if (diff <= 0) return "Xong rồi!";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function CraftDashboard() {
  const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
  const { data: jobs    = [] } = useCraftJobs();
  const { data: bps     = [] } = useBlueprints();
  const { data: stations = [] } = useStations();

  const activeJobs  = (jobs as any[]).filter(j => j.status === "CRAFTING");
  const categories  = [...new Set((recipes as any[]).map(r => r.category))];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl">⚒️</div>
            <div>
              <h1 className="text-xl font-bold text-white">Universe Crafting</h1>
              <p className="text-sm text-muted-foreground">Chế tạo vật phẩm, nâng cấp và phù chú</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Package className="w-4 h-4"/>, label: "Công thức",  value: (recipes as any[]).length, href: "/crafting/recipes" },
              { icon: <Clock className="w-4 h-4"/>,   label: "Đang chế tạo",value: activeJobs.length, href: "/crafting/queue" },
              { icon: <BookOpen className="w-4 h-4"/>,label: "Bản thiết kế",value: (bps as any[]).length, href: "/crafting/blueprints" },
              { icon: <Zap className="w-4 h-4"/>,     label: "Trạm chế tạo",value: (stations as any[]).length, href: "/crafting/stations" },
            ].map(s => (
              <Link key={s.label} href={s.href}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-primary/30 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Active jobs */}
          {activeJobs.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Đang chế tạo</h2>
              <div className="space-y-2">
                {activeJobs.slice(0, 3).map((job: any) => (
                  <div key={job.id} className="bg-white/5 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-2xl">⚒️</div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">Job #{job.id.slice(-6)}</div>
                      <div className="text-xs text-muted-foreground">Hoàn thành: {new Date(job.finishesAt).toLocaleTimeString("vi-VN")}</div>
                    </div>
                    <Badge className={STATUS_COLORS["CRAFTING"]}>⏳ {timeLeft(job.finishesAt)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Danh mục</h2>
              <Link href="/crafting/recipes"><Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Xem tất cả <ChevronRight className="w-3 h-3"/></Button></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <Link key={cat} href={`/crafting/recipes?category=${cat}`}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 cursor-pointer transition-colors text-center">
                    <div className="text-3xl mb-2">{CATEGORY_ICONS[cat] ?? "📦"}</div>
                    <div className="text-sm text-white font-medium">{cat}</div>
                    <div className="text-xs text-muted-foreground">{(recipes as any[]).filter(r => r.category === cat).length} công thức</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/resources", icon: "⛏️", label: "Thu thập tài nguyên", desc: "Khai thác và thu thập" },
              { href: "/shops",     icon: "🏪", label: "Cửa hàng NPC",         desc: "Mua bán vật liệu" },
              { href: "/economy",   icon: "📊", label: "Kinh tế",              desc: "Giá thị trường và thống kê" },
            ].map(l => (
              <Link key={l.href} href={l.href}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-primary/20 cursor-pointer transition-colors flex items-center gap-3">
                  <div className="text-2xl">{l.icon}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{l.label}</div>
                    <div className="text-xs text-muted-foreground">{l.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto"/>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
