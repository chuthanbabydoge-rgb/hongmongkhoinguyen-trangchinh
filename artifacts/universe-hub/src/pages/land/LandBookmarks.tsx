import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader2, BookMarked, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Bookmark {
  id: string; userId: string; parcelId: string; note?: string; createdAt: string;
  parcel: { id: string; name: string; type: string; status: string; currentValue: number } | null;
}

export default function LandBookmarks() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ success: boolean; data: Bookmark[] }>({
    queryKey: ["land", "bookmarks"],
    queryFn: async () => (await fetch("/api/land/bookmarks", {
      headers: { Authorization: `Bearer ${accessToken ?? ""}` },
    })).json() as Promise<{ success: boolean; data: Bookmark[] }>,
    enabled: !!accessToken,
  });
  const bookmarks = data?.data ?? [];

  async function removeBookmark(parcelId: string) {
    await fetch(`/api/land/bookmarks/${parcelId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken ?? ""}` },
    });
    void qc.invalidateQueries({ queryKey: ["land", "bookmarks"] });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">❤️ Ô đất đã lưu</h1>
            <p className="text-muted-foreground mt-1">Danh sách ô đất yêu thích của bạn</p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <BookMarked className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Chưa có ô đất nào được lưu</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Khám phá và lưu ô đất yêu thích từ Parcel Explorer</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="bg-card border border-white/10 rounded-xl p-5">
                  {bm.parcel ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{bm.parcel.name}</h3>
                          <p className="text-muted-foreground text-xs mt-0.5">{bm.parcel.type} — {bm.parcel.status}</p>
                        </div>
                        <button onClick={() => void removeBookmark(bm.parcelId)} className="text-rose-400 hover:text-rose-300 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {bm.note && <p className="text-muted-foreground text-sm italic mb-3">"{bm.note}"</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">{bm.parcel.currentValue.toLocaleString()} Credits</span>
                        <span className="text-xs text-muted-foreground">{new Date(bm.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-sm">Ô đất không tồn tại (ID: {bm.parcelId.slice(0, 8)})</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
