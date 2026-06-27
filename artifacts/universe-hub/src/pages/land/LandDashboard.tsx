import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, Building2, Hammer, ShoppingBag, Zap, TrendingUp, Globe, Loader2, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface DashboardData {
  regions: { id: string; name: string; biome: string; population: number }[];
  cities: { id: string; name: string; type: string; population: number }[];
  parcels: { id: string; name: string; status: string; currentValue: number }[];
  buildings: { id: string; name: string; type: string; level: number }[];
  listings: { id: string; price: number; listingType: string }[];
  totals: { regions: number; cities: number; parcels: number; buildings: number; listings: number };
}

export default function LandDashboard() {
  const { data, isLoading } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ["land", "dashboard"],
    queryFn: async () => (await fetch("/api/land/dashboard")).json() as Promise<{ success: boolean; data: DashboardData }>,
  });
  const dash = data?.data;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border border-white/10 p-8">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg">🏞️</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">Universe Land</h1>
                <p className="text-muted-foreground mt-1">Hạ tầng đất đai và bất động sản Universe — quản lý, giao dịch và phát triển</p>
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: "Vùng", value: dash?.totals?.regions ?? 0, icon: Globe, color: "text-violet-400" },
                  { label: "Thành phố", value: dash?.totals?.cities ?? 0, icon: MapPin, color: "text-blue-400" },
                  { label: "Ô đất", value: dash?.totals?.parcels ?? 0, icon: TrendingUp, color: "text-emerald-400" },
                  { label: "Công trình", value: dash?.totals?.buildings ?? 0, icon: Building2, color: "text-amber-400" },
                  { label: "Đang bán", value: dash?.totals?.listings ?? 0, icon: ShoppingBag, color: "text-rose-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-black/20 backdrop-blur rounded-xl p-4 border border-white/10">
                    <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
                    <div className="text-2xl font-bold text-white">{s.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-violet-400" />Vùng nổi bật</h3>
                <Link href="/land/regions"><a className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">Xem tất <ArrowRight className="w-3 h-3" /></a></Link>
              </div>
              <div className="space-y-2">
                {(dash?.regions ?? []).length > 0 ? dash?.regions.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <span className="text-sm text-white">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.biome}</span>
                  </div>
                )) : <div className="text-muted-foreground text-sm text-center py-4">Chưa có dữ liệu</div>}
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" />Thành phố</h3>
                <Link href="/land/cities"><a className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">Xem tất <ArrowRight className="w-3 h-3" /></a></Link>
              </div>
              <div className="space-y-2">
                {(dash?.cities ?? []).length > 0 ? dash?.cities.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <span className="text-sm text-white">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.type}</span>
                  </div>
                )) : <div className="text-muted-foreground text-sm text-center py-4">Chưa có dữ liệu</div>}
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-400" />Công trình mới</h3>
                <Link href="/land/buildings"><a className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">Xem tất <ArrowRight className="w-3 h-3" /></a></Link>
              </div>
              <div className="space-y-2">
                {(dash?.buildings ?? []).length > 0 ? dash?.buildings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <span className="text-sm text-white">{b.name}</span>
                    <span className="text-xs text-muted-foreground">Lv.{b.level}</span>
                  </div>
                )) : <div className="text-muted-foreground text-sm text-center py-4">Chưa có dữ liệu</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />Ô đất gần đây</h3>
                <Link href="/land/parcels"><a className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">Xem tất <ArrowRight className="w-3 h-3" /></a></Link>
              </div>
              <div className="space-y-2">
                {(dash?.parcels ?? []).length > 0 ? dash?.parcels.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <span className="text-sm text-white">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400">{p.currentValue.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "AVAILABLE" ? "bg-emerald-900/50 text-emerald-300" : "bg-blue-900/50 text-blue-300"}`}>{p.status}</span>
                    </div>
                  </div>
                )) : <div className="text-muted-foreground text-sm text-center py-4">Chưa có dữ liệu</div>}
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-rose-400" />Marketplace</h3>
                <Link href="/land/marketplace"><a className="text-xs text-muted-foreground hover:text-white flex items-center gap-1">Xem tất <ArrowRight className="w-3 h-3" /></a></Link>
              </div>
              <div className="space-y-2">
                {(dash?.listings ?? []).length > 0 ? dash?.listings.map((l) => (
                  <div key={l.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-900/50 text-rose-300">{l.listingType}</span>
                    <span className="text-sm text-amber-400 font-medium">{l.price.toLocaleString()}</span>
                  </div>
                )) : <div className="text-muted-foreground text-sm text-center py-4">Chưa có dữ liệu</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Khám phá vùng", href: "/land/regions", icon: Globe, color: "from-violet-500/20 to-violet-600/10", border: "border-violet-500/30" },
              { label: "Xây dựng", href: "/land/construction", icon: Hammer, color: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/30" },
              { label: "Teleport", href: "/land/teleport", icon: Zap, color: "from-cyan-500/20 to-cyan-600/10", border: "border-cyan-500/30" },
              { label: "Phân tích", href: "/land/analytics", icon: TrendingUp, color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30" },
            ].map((q) => (
              <Link key={q.href} href={q.href}>
                <a className={`block bg-gradient-to-br ${q.color} border ${q.border} rounded-xl p-4 hover:opacity-80 transition-opacity cursor-pointer`}>
                  <q.icon className="w-6 h-6 text-white mb-2" />
                  <div className="text-sm font-medium text-white">{q.label}</div>
                </a>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
