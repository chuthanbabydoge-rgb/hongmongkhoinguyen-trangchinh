import { createSignal, createResource, For, Show } from "solid-js";

interface Listing {
  id: string; parcelId: string; sellerId: string; price: number;
  listingType: string; description?: string; isActive: boolean;
  createdAt: string; rentalDuration?: number;
}

async function fetchListings(params: string): Promise<Listing[]> {
  const res = await fetch(`/api/land/marketplace?${params}`);
  const json = await res.json();
  return json.data ?? [];
}

export default function LandMarketplace() {
  const [typeFilter, setTypeFilter] = createSignal("ALL");
  const [sortBy, setSortBy] = createSignal("newest");

  const params = () => {
    const p = new URLSearchParams({ isActive: "true", limit: "50" });
    if (typeFilter() !== "ALL") p.set("listingType", typeFilter());
    return p.toString();
  };

  const [listings] = createResource(params, fetchListings);

  const sorted = () => {
    const list = [...(listings() ?? [])];
    if (sortBy() === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy() === "price_desc") list.sort((a, b) => b.price - a.price);
    return list;
  };

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">🏷️ Chợ Bất động sản</h1>
          <p class="text-slate-400 mt-1">Mua bán và thuê ô đất trong Universe</p>
        </div>
      </div>

      <div class="flex gap-3 flex-wrap">
        {["ALL", "SALE", "RENT"].map(t => (
          <button
            onClick={() => setTypeFilter(t)}
            class={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${typeFilter() === t ? "bg-rose-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
          >
            {t === "ALL" ? "Tất cả" : t === "SALE" ? "🏷️ Mua bán" : "🔑 Thuê"}
          </button>
        ))}
        <select
          value={sortBy()}
          onChange={(e) => setSortBy(e.currentTarget.value)}
          class="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 ml-auto"
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá: Thấp → Cao</option>
          <option value="price_desc">Giá: Cao → Thấp</option>
        </select>
      </div>

      <Show when={listings()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={sorted()}>{(listing) => (
            <div class="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-rose-500 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <span class={`text-xs px-2 py-1 rounded-full font-medium ${listing.listingType === "SALE" ? "bg-blue-900 text-blue-300" : "bg-violet-900 text-violet-300"}`}>
                    {listing.listingType === "SALE" ? "🏷️ Bán" : "🔑 Cho thuê"}
                  </span>
                </div>
                <div class="text-right">
                  <div class="text-emerald-400 text-xl font-bold">{listing.price.toLocaleString()}</div>
                  <div class="text-slate-500 text-xs">Credits</div>
                </div>
              </div>

              {listing.description && (
                <p class="text-slate-400 text-sm mb-3">{listing.description}</p>
              )}

              {listing.rentalDuration && (
                <div class="text-xs text-slate-400 mb-3">
                  Thời hạn thuê: <span class="text-violet-400">{listing.rentalDuration} ngày</span>
                </div>
              )}

              <div class="text-xs text-slate-500 mb-4">
                ID đất: {listing.parcelId.slice(0, 8)}...
              </div>

              <div class="flex gap-2">
                <button class={`flex-1 text-white text-sm rounded-lg py-2 font-medium transition-colors ${listing.listingType === "SALE" ? "bg-blue-600 hover:bg-blue-700" : "bg-violet-600 hover:bg-violet-700"}`}>
                  {listing.listingType === "SALE" ? "Mua ngay" : "Thuê ngay"}
                </button>
                <button class="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg px-3 py-2 transition-colors">
                  ❤️
                </button>
              </div>
            </div>
          )}</For>
        </div>
        {sorted().length === 0 && (
          <div class="text-center py-12 text-slate-400">Không có listing nào</div>
        )}
      </Show>
    </div>
  );
}
