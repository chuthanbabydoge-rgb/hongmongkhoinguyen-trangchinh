import { createResource, For, Show } from "solid-js";
import { useAuth } from "@/hooks/useAccount";

interface Bookmark {
  id: string; userId: string; parcelId: string; note?: string; createdAt: string;
  parcel: { id: string; name: string; type: string; status: string; currentValue: number } | null;
}

async function fetchBookmarks(): Promise<Bookmark[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) return [];
  const res = await fetch("/api/land/bookmarks", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json.data ?? [];
}

export default function LandBookmarks() {
  const [bookmarks, { refetch }] = createResource(fetchBookmarks);

  async function removeBookmark(parcelId: string) {
    const token = localStorage.getItem("accessToken");
    await fetch(`/api/land/bookmarks/${parcelId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    refetch();
  }

  return (
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">❤️ Ô đất đã lưu</h1>
        <p class="text-slate-400 mt-1">Danh sách ô đất yêu thích của bạn</p>
      </div>

      <Show when={bookmarks()} fallback={<div class="text-slate-400">Đang tải...</div>}>
        <Show when={(bookmarks()?.length ?? 0) > 0} fallback={
          <div class="text-center py-20">
            <div class="text-6xl mb-4">🏞️</div>
            <p class="text-slate-400">Chưa có ô đất nào được lưu</p>
            <p class="text-slate-500 text-sm mt-1">Khám phá và lưu ô đất yêu thích từ Parcel Explorer</p>
          </div>
        }>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={bookmarks()}>{(bm) => (
              <div class="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <Show when={bm.parcel} fallback={
                  <div class="text-slate-400 text-sm">Ô đất không tồn tại (ID: {bm.parcelId.slice(0, 8)})</div>
                }>
                  {(parcel) => (
                    <>
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <h3 class="text-white font-semibold">{parcel().name}</h3>
                          <p class="text-slate-400 text-xs mt-0.5">{parcel().type} — {parcel().status}</p>
                        </div>
                        <button
                          onClick={() => removeBookmark(bm.parcelId)}
                          class="text-red-400 hover:text-red-300 transition-colors text-lg"
                        >❤️</button>
                      </div>
                      {bm.note && (
                        <p class="text-slate-400 text-sm italic mb-3">"{bm.note}"</p>
                      )}
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-400 font-bold">{parcel().currentValue.toLocaleString()}</span>
                        <span class="text-xs text-slate-500">{new Date(bm.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </>
                  )}
                </Show>
              </div>
            )}</For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
