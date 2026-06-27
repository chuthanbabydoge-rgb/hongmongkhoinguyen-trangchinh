import { useQuery } from "@tanstack/react-query";
import { Landmark, Users, Scale, Vote, FileText, Megaphone, TrendingUp, Shield, Globe, Flag } from "lucide-react";
import { Link } from "wouter";

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Landmark; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function NationDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["nation-dashboard"],
    queryFn: () => fetch("/api/nation/dashboard").then(r => r.json()).then(r => r.data),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  const n = data?.nation;
  const stats = data?.latestStats;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-blue-900/40 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{n?.flag ?? "🌌"}</div>
          <div>
            <h1 className="text-3xl font-bold text-white">{n?.officialName ?? "Universe Prime"}</h1>
            <p className="text-indigo-300">{n?.motto}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Thủ đô</p>
            <p className="text-white font-semibold">{n?.capital}</p>
            <p className="text-xs text-muted-foreground mt-1">Đơn vị tiền tệ</p>
            <p className="text-amber-400 font-semibold">{n?.currency}</p>
          </div>
        </div>
        {!data?.citizenship && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-amber-300">Bạn chưa là công dân.</span>
            <Link href="/nation/citizens/register" className="ml-auto text-sm font-medium text-amber-400 hover:text-amber-300 underline">Đăng ký ngay →</Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Users}    label="Công dân"      value={(n?.population ?? 0).toLocaleString()} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={Scale}    label="Luật đã thông qua" value={data?.activeLaws ?? 0}           color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={Vote}     label="Bầu cử"        value={data?.elections?.length ?? 0}         color="bg-green-500/20 text-green-400" />
        <StatCard icon={FileText} label="Ngân sách"     value={`${((n?.gdp ?? 0) / 1e9).toFixed(1)}B`} color="bg-amber-500/20 text-amber-400" />
        <StatCard icon={Landmark} label="Bộ ngành"      value={data?.ministries?.length ?? 0}        color="bg-rose-500/20 text-rose-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Megaphone className="w-4 h-4 text-amber-400" /> Thông báo chính phủ</h2>
            <Link href="/nation/announcements" className="text-xs text-indigo-400 hover:text-indigo-300">Xem tất cả →</Link>
          </div>
          <div className="space-y-3">
            {(data?.announcements ?? []).slice(0, 5).map((a: Record<string, string>) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-white/3 rounded-lg">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${a.priority === "URGENT" ? "bg-red-400" : a.priority === "HIGH" ? "bg-amber-400" : "bg-blue-400"}`} />
                <div>
                  <p className="text-sm text-white">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Nav */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-400" /> Điều hướng nhanh</h2>
          <div className="space-y-2">
            {[
              { href: "/nation/government", label: "Trung tâm Chính phủ", icon: Landmark },
              { href: "/nation/citizens", label: "Danh sách Công dân", icon: Users },
              { href: "/nation/laws", label: "Trung tâm Luật pháp", icon: Scale },
              { href: "/nation/elections", label: "Trung tâm Bầu cử", icon: Vote },
              { href: "/nation/budget", label: "Ngân sách Quốc gia", icon: TrendingUp },
              { href: "/nation/tax", label: "Thuế Quốc gia", icon: FileText },
              { href: "/nation/passport", label: "Hộ chiếu", icon: Shield },
              { href: "/nation/visa", label: "Visa", icon: Globe },
              { href: "/nation/events", label: "Sự kiện Quốc gia", icon: Flag },
              { href: "/nation/statistics", label: "Thống kê Quốc gia", icon: TrendingUp },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-muted-foreground hover:text-white">
                <item.icon className="w-4 h-4 text-indigo-400" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active Elections */}
      {(data?.elections ?? []).length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Vote className="w-4 h-4 text-green-400" /> Bầu cử</h2>
            <Link href="/nation/elections" className="text-xs text-indigo-400 hover:text-indigo-300">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(data?.elections ?? []).slice(0, 3).map((e: Record<string, string>) => (
              <Link key={e.id} href={`/nation/elections/${e.id}`} className="p-4 bg-white/3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : e.status === "UPCOMING" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>{e.status}</span>
                  <span className="text-xs text-muted-foreground">{e.totalVotes} phiếu</span>
                </div>
                <p className="text-sm text-white font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{e.electionType}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
