import { useQuery } from "@tanstack/react-query";
import { Users, Search, BadgeCheck, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function CitizenDirectory() {
  const [search, setSearch] = useState("");
  const { data: citizens = [], isLoading } = useQuery({
    queryKey: ["nation-citizens"],
    queryFn: () => fetch("/api/nation/citizens").then(r => r.json()).then(r => r.data ?? []),
  });

  const filtered = (citizens as Record<string, string>[]).filter(c =>
    !search || c.citizenId?.toLowerCase().includes(search.toLowerCase()) || c.userId?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Danh bạ Công dân</h1>
            <p className="text-sm text-muted-foreground">{citizens.length} công dân đã đăng ký</p>
          </div>
        </div>
        <Link href="/nation/citizens/register" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm transition-colors">
          Đăng ký công dân
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm" placeholder="Tìm kiếm công dân..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/10">
          <span className="text-xs text-muted-foreground font-medium">Mã công dân</span>
          <span className="text-xs text-muted-foreground font-medium">User ID</span>
          <span className="text-xs text-muted-foreground font-medium">Trạng thái</span>
          <span className="text-xs text-muted-foreground font-medium">Ngày đăng ký</span>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.slice(0, 50).map(c => (
            <div key={c.id} className="grid grid-cols-4 gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-white font-mono">{c.citizenId}</span>
              </div>
              <span className="text-sm text-muted-foreground truncate">{c.userId}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${c.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : c.status === "PENDING" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{c.status}</span>
              <span className="text-xs text-muted-foreground">{new Date(c.registeredAt).toLocaleDateString("vi-VN")}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">Chưa có công dân nào</div>
          )}
        </div>
      </div>
    </div>
  );
}
