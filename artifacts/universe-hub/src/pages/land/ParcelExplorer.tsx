import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";

interface Parcel {
  id: string; name: string; slug: string; districtId: string;
  type: string; status: string; size: number;
  baseValue: number; currentValue: number; isListed: boolean;
  listingPrice?: number; maxBuildings: number;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-900/60 text-emerald-300",
  OWNED: "bg-blue-900/60 text-blue-300",
  RENTED: "bg-violet-900/60 text-violet-300",
  RESERVED: "bg-amber-900/60 text-amber-300",
  LOCKED: "bg-muted text-muted-foreground",
  AUCTION: "bg-rose-900/60 text-rose-300",
};

const TYPE_ICONS: Record<string, string> = {
  RESIDENTIAL: "🏠", COMMERCIAL: "🏪", INDUSTRIAL: "🏭",
  AGRICULTURAL: "🌾", FOREST: "🌲", WATER: "💧",
  DESERT: "🏜️", MOUNTAIN: "⛰️", SNOW: "❄️", SPECIAL: "⭐",
};

const STATUSES = ["ALL", "AVAILABLE", "OWNED", "RENTED", "RESERVED", "AUCTION"];
const TYPES = ["ALL", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "AGRICULTURAL", "FOREST", "WATER", "SPECIAL"];

export default function ParcelExplorer() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const params = new URLSearchParams({ limit: "100" });
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (typeFilter !== "ALL") params.set("type", typeFilter);
  if (search) params.set("search", search);

  const { data, isLoading } = useQuery<{ success: boolean; data: Parcel[] }>({
    queryKey: ["land", "parcels", statusFilter, typeFilter, search],
    queryFn: async () => (await fetch(`/api/land/parcels?${params.toString()}`)).json() as Promise<{ success: boolean; data: Parcel[] }>,
  });

  const buyMutation = useMutation({
    mutationFn: async (parcelId: string) => {
      const res = await fetch(`/api/land/parcels/${parcelId}/buy`, {
        method: "POST",
        headers: { Authorization: accessToken ?? "", "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "parcels"] }); },
  });

  const parcels = data?.data ?? [];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📦 Khám phá Ô đất</h1>
            <p className="text-muted-foreground mt-1">Browse và mua ô đất trong Universe</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm ô đất..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-muted/40 text-white rounded-lg pl-9 pr-4 py-2 text-sm outline-none border border-white/10 focus:border-emerald-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-muted/40 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-muted/40 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
            >
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {parcels.map((parcel) => (
                  <div key={parcel.id} className="bg-card border border-white/10 rounded-xl p-4 hover:border-emerald-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TYPE_ICONS[parcel.type] ?? "📦"}</span>
                        <h3 className="text-white font-semibold text-sm">{parcel.name}</h3>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[parcel.status] ?? "bg-muted text-muted-foreground"}`}>
                        {parcel.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center mb-3">
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-white text-xs font-bold">{parcel.size.toFixed(0)} m²</div>
                        <div className="text-muted-foreground text-xs">Diện tích</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2">
                        <div className="text-emerald-400 text-xs font-bold">{parcel.currentValue.toLocaleString()}</div>
                        <div className="text-muted-foreground text-xs">Giá trị</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/land/parcels/${parcel.id}`}>
                        <a className="flex-1 text-center bg-muted/40 hover:bg-muted/60 text-muted-foreground text-xs rounded-lg py-1.5 transition-colors">Chi tiết</a>
                      </Link>
                      {parcel.status === "AVAILABLE" && (
                        <button
                          onClick={() => buyMutation.mutate(parcel.id)}
                          disabled={buyMutation.isPending}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg py-1.5 transition-colors disabled:opacity-50"
                        >
                          Mua đất
                        </button>
                      )}
                    </div>
                    {parcel.isListed && parcel.listingPrice && (
                      <div className="mt-2 text-center text-amber-400 text-xs">
                        Rao bán: {parcel.listingPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {parcels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không tìm thấy ô đất nào</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
