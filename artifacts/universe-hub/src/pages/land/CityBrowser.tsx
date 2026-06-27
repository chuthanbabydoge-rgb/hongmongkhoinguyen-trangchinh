import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, Loader2, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface City {
  id: string; name: string; slug: string; regionId: string;
  type: string; population: number; taxRate: number;
  mayorId?: string; maxDistricts: number; isActive: boolean;
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

const CITY_TYPES = ["ALL", "CAPITAL", "METROPOLIS", "CITY", "TOWN", "VILLAGE", "OUTPOST", "SPECIAL"];

export default function CityBrowser() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const { data, isLoading } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["land", "cities"],
    queryFn: async () => (await fetch("/api/land/cities?limit=50")).json() as Promise<{ success: boolean; data: City[] }>,
  });

  const cities = data?.data ?? [];
  const filtered = cities.filter(c =>
    (filter === "ALL" || c.type === filter) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2"><MapPin className="w-6 h-6 text-blue-400" />Thành phố</h1>
              <p className="text-muted-foreground mt-1">Các đô thị trong Universe</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm thành phố..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-muted/40 text-white rounded-lg pl-9 pr-4 py-2 text-sm outline-none border border-white/10 focus:border-blue-500"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-muted/40 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
              >
                {CITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((city) => (
                  <Link key={city.id} href={`/land/cities/${city.id}`}>
                    <a className="block bg-card border border-white/10 rounded-xl p-5 hover:border-blue-500/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{TYPE_ICONS[city.type] ?? "🏙️"}</span>
                            <h3 className="text-white font-semibold">{city.name}</h3>
                          </div>
                          <p className="text-muted-foreground text-xs mt-0.5">{city.slug}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[city.type] ?? "bg-muted text-muted-foreground"}`}>
                          {city.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/40 rounded-lg p-2">
                          <div className="text-white text-sm font-bold">{city.population.toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">Dân số</div>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <div className="text-white text-sm font-bold">{(city.taxRate * 100).toFixed(1)}%</div>
                          <div className="text-muted-foreground text-xs">Thuế</div>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <div className="text-white text-sm font-bold">{city.maxDistricts}</div>
                          <div className="text-muted-foreground text-xs">Quận</div>
                        </div>
                      </div>
                      {city.mayorId && (
                        <div className="mt-3 text-xs text-muted-foreground">Thị trưởng: {city.mayorId.slice(0, 12)}...</div>
                      )}
                    </a>
                  </Link>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không tìm thấy thành phố nào</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
