import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Users, Crown, Building2, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function GovernmentCenter() {
  const { data, isLoading } = useQuery({
    queryKey: ["nation-government"],
    queryFn: () => fetch("/api/nation/government").then(r => r.json()).then(r => r.data),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Landmark className="w-7 h-7 text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Trung tâm Chính phủ</h1>
          <p className="text-sm text-muted-foreground">Quản lý và điều hành bộ máy nhà nước</p>
        </div>
      </div>

      {/* Active Term */}
      {data?.term && (
        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Nhiệm kỳ hiện tại</p>
              <p className="text-lg font-bold text-white">{data.term.name}</p>
            </div>
            <span className={`ml-auto text-xs px-3 py-1 rounded-full ${data.term.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{data.term.status}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{data.term.description}</p>
        </div>
      )}

      {/* Government Members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> Thành viên Chính phủ</h2>
          <Link href="/nation/members" className="text-xs text-indigo-400 hover:text-indigo-300">Xem tất cả →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.members ?? []).slice(0, 9).map((m: Record<string, string>) => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                {m.role?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{m.title || m.role}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${m.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{m.isActive ? "Active" : "Inactive"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ministries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-purple-400" /> Các Bộ ngành</h2>
          <Link href="/nation/ministries" className="text-xs text-indigo-400 hover:text-indigo-300">Quản lý →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(data?.ministries ?? []).map((m: Record<string, string>) => (
            <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/8 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">{m.icon}</div>
              <p className="text-sm font-semibold text-white">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.shortName}</p>
              <p className="text-xs text-amber-400 mt-1">{Number(m.budget ?? 0).toLocaleString()} UNI</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
