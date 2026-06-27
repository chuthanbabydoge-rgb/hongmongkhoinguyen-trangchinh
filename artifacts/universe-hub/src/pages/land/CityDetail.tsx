import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Loader2, Users, Building2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface City {
  id: string; name: string; slug: string; regionId: string;
  type: string; population: number; taxRate: number;
  mayorId?: string; maxDistricts: number; isActive: boolean;
  description?: string; foundedAt?: string; wealth?: number;
}

const TYPE_COLORS: Record<string, string> = {
  CAPITAL: "bg-amber-900/60 text-amber-300",
  METROPOLIS: "bg-violet-900/60 text-violet-300",
  CITY: "bg-blue-900/60 text-blue-300",
  TOWN: "bg-emerald-900/60 text-emerald-300",
  VILLAGE: "bg-green-900/60 text-green-300",
  OUTPOST: "bg-orange-900/60 text-orange-300",
  SPECIAL: "bg-pink-900/60 text-pink-300",
};

const TYPE_ICONS: Record<string, string> = {
  CAPITAL: "👑", METROPOLIS: "🏙️", CITY: "🌆", TOWN: "🏘️",
  VILLAGE: "🏡", OUTPOST: "⛺", SPECIAL: "✨",
};

export default function CityDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<{ success: boolean; data: City }>({
    queryKey: ["land", "cities", id],
    queryFn: async () => (await fetch(`/api/land/cities/${id}`)).json() as Promise<{ success: boolean; data: City }>,
    enabled: !!id,
  });

  const city = data?.data;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/land/cities">
              <a className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></a>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">{city ? (TYPE_ICONS[city.type] ?? "🏙️") : "🏙️"}</span>
                {city?.name ?? "Đang tải..."}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">{city?.slug}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : !city ? (
            <div className="text-center py-12 text-muted-foreground">Không tìm thấy thành phố</div>
          ) : (
            <>
              <div className="bg-card border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-sm px-3 py-1 rounded-full ${TYPE_COLORS[city.type] ?? "bg-muted text-muted-foreground"}`}>{city.type}</span>
                    {city.description && <p className="text-muted-foreground mt-3 text-sm">{city.description}</p>}
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${city.isActive ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>
                    {city.isActive ? "✅ Hoạt động" : "❌ Không hoạt động"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Dân số", value: city.population.toLocaleString(), icon: Users, color: "text-blue-400" },
                    { label: "Thuế suất", value: `${(city.taxRate * 100).toFixed(1)}%`, icon: Building2, color: "text-amber-400" },
                    { label: "Max quận", value: city.maxDistricts, icon: MapPin, color: "text-violet-400" },
                    { label: "Tài sản", value: city.wealth ? city.wealth.toLocaleString() : "N/A", icon: Building2, color: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/30 rounded-xl p-4 text-center">
                      <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                      <div className="text-xl font-bold text-white">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Thông tin quản trị</h3>
                  <div className="space-y-3">
                    {city.mayorId && (
                      <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground text-sm">Thị trưởng</span>
                        <span className="text-white text-sm font-mono">{city.mayorId.slice(0, 12)}...</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground text-sm">Region ID</span>
                      <span className="text-white text-sm font-mono">{city.regionId.slice(0, 12)}...</span>
                    </div>
                    {city.foundedAt && (
                      <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground text-sm">Thành lập</span>
                        <span className="text-white text-sm">{new Date(city.foundedAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Hành động nhanh</h3>
                  <div className="space-y-2">
                    <Link href={`/land/districts?cityId=${city.id}`}>
                      <a className="block w-full bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-sm rounded-lg py-2.5 px-4 transition-colors text-center">
                        🏘️ Xem quận/huyện
                      </a>
                    </Link>
                    <Link href="/land/parcels">
                      <a className="block w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-sm rounded-lg py-2.5 px-4 transition-colors text-center">
                        📦 Khám phá ô đất
                      </a>
                    </Link>
                    <Link href="/land/marketplace">
                      <a className="block w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-sm rounded-lg py-2.5 px-4 transition-colors text-center">
                        🏷️ Chợ bất động sản
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
