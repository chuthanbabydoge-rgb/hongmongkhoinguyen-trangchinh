import { createSignal, createResource, For, Show } from "solid-js";

interface Parcel {
  id: string; name: string; slug: string; districtId: string;
  type: string; status: string; size: number;
  baseValue: number; currentValue: number; isListed: boolean;
  listingPrice?: number; maxBuildings: number;
}

async function fetchParcels(params: string): Promise<Parcel[]> {
  const res = await fetch(`/api/land/parcels?${params}&limit=100`);
  const json = await res.json();
  return json.data ?? [];
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-900 text-emerald-300",
  OWNED: "bg-blue-900 text-blue-300",
  RENTED: "bg-violet-900 text-violet-300",
  RESERVED: "bg-amber-900 text-amber-300",
  LOCKED: "bg-slate-700 text-slate-300",
  AUCTION: "bg-rose-900 text-rose-300",
};

const TYPE_ICONS: Record<string, string> = {
  RESIDENTIAL: "🏠", COMMERCIAL: "🏪", INDUSTRIAL: "🏭",
  AGRICULTURAL: "🌾", FOREST: "🌲", WATER: "💧",
  DESERT: "🏜️", MOUNTAIN: "⛰️", SNOW: "❄️", SPECIAL: "⭐",
};

export default function ParcelExplorer() {
  const [search, setSearch] = createSignal("");
  const [statusFilter, setStatusFilter] = createSignal("ALL");
  const [typeFilter, setTypeFilter] = createSignal("ALL");

  const params = () => {
    const p = new URLSearchParams();
    if (statusFilter() !== "ALL") p.set("status", statusFilter());
    if (typeFilter() !== "ALL") p.set("type", typeFilter());
    if (search()) p.set("search", search());
    return p.toString();
  };

  const [parcels, { refetch }] = createResource(params, fetchParcels);

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">📦 Khám phá Ô đất</h1>
          <p class="text-slate-400 mt-1">Browse và mua ô đất trong Universe</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Tìm ô đất..."
          value={search()}
          onInput={(e) => { setSearch(e.currentTarget.value); }}
          class="bg-slate-700 text-white rounded-lg px-4 py-2 text-sm outline-none border border-slate-600 focus:border-emerald-500"
        />
        <select
          value={statusFilter()}
          onChange={(e) => setStatusFilter(e.currentTarget.value)}
          class="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600"
        >
          {["ALL", "AVAILABLE", "OWNED", "RENTED", "RESERVED", "AUCTION"].map(s => (
            <option value={s}>{s}</option>
          ))}
        </select>
        <select
          value={typeFilter()}
          onChange={(e) => setTypeFilter(e.currentTarget.value)}
          class="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600"
        >
          {["ALL", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "AGRICULTURAL", "FOREST", "WATER", "SPECIAL"].map(t => (
            <option value={t}>{t}</option>
          ))}
        </select>
      </div>

      <Show when={parcels()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <For each={parcels()}>{(parcel) => (
            <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-emerald-500 transition-colors">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{TYPE_ICONS[parcel.type] ?? "📦"}</span>
                  <h3 class="text-white font-semibold text-sm">{parcel.name}</h3>
                </div>
                <span class={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[parcel.status] ?? "bg-slate-700 text-slate-300"}`}>
                  {parcel.status}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-center mb-3">
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-white text-xs font-bold">{parcel.size.toFixed(0)} m²</div>
                  <div class="text-slate-500 text-xs">Diện tích</div>
                </div>
                <div class="bg-slate-700 rounded-lg p-2">
                  <div class="text-emerald-400 text-xs font-bold">{parcel.currentValue.toLocaleString()}</div>
                  <div class="text-slate-500 text-xs">Giá trị</div>
                </div>
              </div>
              {parcel.status === "AVAILABLE" && (
                <button class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg py-1.5 transition-colors">
                  Mua đất
                </button>
              )}
              {parcel.isListed && parcel.listingPrice && (
                <div class="mt-2 text-center text-amber-400 text-xs">
                  Đang rao bán: {parcel.listingPrice.toLocaleString()}
                </div>
              )}
            </div>
          )}</For>
        </div>
        {(parcels()?.length ?? 0) === 0 && (
          <div class="text-center py-12 text-slate-400">Không tìm thấy ô đất nào</div>
        )}
      </Show>
    </div>
  );
}
