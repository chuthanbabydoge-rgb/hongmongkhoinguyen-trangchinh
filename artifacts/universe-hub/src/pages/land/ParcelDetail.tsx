import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Loader2, Heart, ShoppingBag } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";

interface Parcel {
  id: string; name: string; slug: string; districtId: string;
  type: string; status: string; size: number;
  baseValue: number; currentValue: number; isListed: boolean;
  listingPrice?: number; maxBuildings: number; ownerId?: string;
  description?: string; rentPrice?: number; mapX?: number; mapY?: number;
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

export default function ParcelDetail() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ success: boolean; data: Parcel }>({
    queryKey: ["land", "parcels", id],
    queryFn: async () => (await fetch(`/api/land/parcels/${id}`)).json() as Promise<{ success: boolean; data: Parcel }>,
    enabled: !!id,
  });

  const buyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/land/parcels/${id}/buy`, {
        method: "POST",
        headers: { Authorization: accessToken ?? "", "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "parcels"] }); },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/land/bookmarks", {
        method: "POST",
        headers: { Authorization: accessToken ?? "", "Content-Type": "application/json" },
        body: JSON.stringify({ parcelId: id }),
      });
      return res.json();
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["land", "bookmarks"] }); },
  });

  const parcel = data?.data;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/land/parcels">
              <a className="p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"><ArrowLeft className="w-4 h-4 text-muted-foreground" /></a>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>{parcel ? (TYPE_ICONS[parcel.type] ?? "📦") : "📦"}</span>
                {parcel?.name ?? "Đang tải..."}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">{parcel?.slug}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : !parcel ? (
            <div className="text-center py-12 text-muted-foreground">Không tìm thấy ô đất</div>
          ) : (
            <>
              <div className="bg-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-3 py-1 rounded-full ${STATUS_COLORS[parcel.status] ?? "bg-muted text-muted-foreground"}`}>{parcel.status}</span>
                    <span className="text-muted-foreground text-sm">{parcel.type}</span>
                  </div>
                  <button
                    onClick={() => bookmarkMutation.mutate()}
                    disabled={bookmarkMutation.isPending}
                    className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-sm rounded-lg px-3 py-2 transition-colors"
                  >
                    <Heart className="w-4 h-4" />Lưu
                  </button>
                </div>

                {parcel.description && <p className="text-muted-foreground text-sm mb-6">{parcel.description}</p>}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Diện tích", value: `${parcel.size.toFixed(0)} m²`, color: "text-blue-400" },
                    { label: "Giá cơ sở", value: parcel.baseValue.toLocaleString(), color: "text-muted-foreground" },
                    { label: "Giá hiện tại", value: parcel.currentValue.toLocaleString(), color: "text-emerald-400" },
                    { label: "Max công trình", value: parcel.maxBuildings, color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/30 rounded-xl p-4 text-center">
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {parcel.mapX !== undefined && parcel.mapY !== undefined && (
                  <p className="text-xs text-muted-foreground mb-4">📍 Vị trí: ({parcel.mapX.toFixed(1)}, {parcel.mapY.toFixed(1)})</p>
                )}

                <div className="flex gap-3">
                  {parcel.status === "AVAILABLE" && (
                    <button
                      onClick={() => buyMutation.mutate()}
                      disabled={buyMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl py-3 transition-colors disabled:opacity-50"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {buyMutation.isPending ? "Đang mua..." : `Mua đất — ${parcel.currentValue.toLocaleString()} Credits`}
                    </button>
                  )}
                  {parcel.isListed && parcel.listingPrice && (
                    <div className="flex-1 text-center bg-amber-600/20 text-amber-300 text-sm rounded-xl py-3">
                      🏷️ Rao bán: {parcel.listingPrice.toLocaleString()} Credits
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Thông tin sở hữu</h3>
                  <div className="space-y-2">
                    {parcel.ownerId ? (
                      <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                        <span className="text-muted-foreground text-sm">Chủ sở hữu</span>
                        <span className="text-white text-sm font-mono">{parcel.ownerId.slice(0, 12)}...</span>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">Chưa có chủ</div>
                    )}
                    <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground text-sm">Quận</span>
                      <span className="text-white text-sm font-mono">{parcel.districtId.slice(0, 12)}...</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Hành động</h3>
                  <div className="space-y-2">
                    <Link href="/land/buildings">
                      <a className="block w-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-sm rounded-lg py-2.5 px-4 transition-colors text-center">🏗️ Xem công trình</a>
                    </Link>
                    <Link href="/land/construction">
                      <a className="block w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm rounded-lg py-2.5 px-4 transition-colors text-center">🔨 Xây dựng mới</a>
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
