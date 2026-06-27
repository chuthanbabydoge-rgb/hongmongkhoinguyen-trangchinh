import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader2, ShoppingBag } from "lucide-react";

interface Listing {
  id: string; parcelId: string; sellerId: string; price: number;
  listingType: string; description?: string; isActive: boolean;
  createdAt: string; rentalDuration?: number;
}

export default function LandMarketplace() {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const params = new URLSearchParams({ isActive: "true", limit: "50" });
  if (typeFilter !== "ALL") params.set("listingType", typeFilter);

  const { data, isLoading } = useQuery<{ success: boolean; data: Listing[] }>({
    queryKey: ["land", "marketplace", typeFilter],
    queryFn: async () => (await fetch(`/api/land/marketplace?${params.toString()}`)).json() as Promise<{ success: boolean; data: Listing[] }>,
  });

  const listings = [...(data?.data ?? [])];
  if (sortBy === "price_asc") listings.sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") listings.sort((a, b) => b.price - a.price);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">🏷️ Chợ Bất động sản</h1>
              <p className="text-muted-foreground mt-1">Mua bán và thuê ô đất trong Universe</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {["ALL", "SALE", "RENT"].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${typeFilter === t ? "bg-rose-600 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
              >
                {t === "ALL" ? "Tất cả" : t === "SALE" ? "🏷️ Mua bán" : "🔑 Thuê"}
              </button>
            ))}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.currentTarget.value)}
              className="bg-white/5 text-white rounded-lg px-3 py-2 text-sm border border-white/10 ml-auto"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp → Cao</option>
              <option value="price_desc">Giá: Cao → Thấp</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Không có listing nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-card border border-white/10 rounded-xl p-5 hover:border-rose-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${listing.listingType === "SALE" ? "bg-blue-900/50 text-blue-300" : "bg-violet-900/50 text-violet-300"}`}>
                      {listing.listingType === "SALE" ? "🏷️ Bán" : "🔑 Cho thuê"}
                    </span>
                    <div className="text-right">
                      <div className="text-emerald-400 text-xl font-bold">{listing.price.toLocaleString()}</div>
                      <div className="text-muted-foreground text-xs">Credits</div>
                    </div>
                  </div>
                  {listing.description && <p className="text-muted-foreground text-sm mb-3">{listing.description}</p>}
                  {listing.rentalDuration && (
                    <div className="text-xs text-muted-foreground mb-3">
                      Thời hạn thuê: <span className="text-violet-400">{listing.rentalDuration} ngày</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mb-4">ID đất: {listing.parcelId.slice(0, 8)}...</div>
                  <div className="flex gap-2">
                    <button className={`flex-1 text-white text-sm rounded-lg py-2 font-medium transition-colors ${listing.listingType === "SALE" ? "bg-blue-600 hover:bg-blue-700" : "bg-violet-600 hover:bg-violet-700"}`}>
                      {listing.listingType === "SALE" ? "Mua ngay" : "Thuê ngay"}
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 text-muted-foreground text-sm rounded-lg px-3 py-2 transition-colors">❤️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
