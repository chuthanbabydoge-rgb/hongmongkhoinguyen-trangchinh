import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, Users, DollarSign } from "lucide-react";

export default function NationalStatistics() {
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["national-stats"],
    queryFn: () => fetch("/api/nation/statistics").then(r => r.json()).then(r => r.data ?? []),
  });

  const { data: nation } = useQuery({
    queryKey: ["nation-info"],
    queryFn: () => fetch("/api/nation").then(r => r.json()).then(r => r.data),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;

  const latest = stats[0] as Record<string, number> | undefined;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-7 h-7 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Thống kê Quốc gia</h1>
      </div>

      {/* Nation Info */}
      {nation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "GDP", value: `${(Number(nation.gdp ?? 0) / 1e9).toFixed(1)}B UNI`, icon: DollarSign, color: "text-amber-400" },
            { label: "Dân số", value: Number(nation.population ?? 0).toLocaleString(), icon: Users, color: "text-blue-400" },
            { label: "Diện tích", value: `${Number(nation.area ?? 0).toLocaleString()} km²`, icon: BarChart2, color: "text-green-400" },
            { label: "Tăng trưởng", value: "+5.2%", icon: TrendingUp, color: "text-purple-400" },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Latest Stats */}
      {latest && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Số liệu mới nhất</h2>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{(stats[0] as Record<string, string>)?.period}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: "GDP", value: `${(latest.gdp / 1e9).toFixed(2)}B UNI` },
              { label: "Dân số", value: latest.population.toLocaleString() },
              { label: "Thu thuế", value: `${(latest.taxRevenue / 1e6).toFixed(1)}M UNI` },
              { label: "Chi tiêu", value: `${(latest.spending / 1e6).toFixed(1)}M UNI` },
              { label: "Công dân", value: latest.citizenCount.toLocaleString() },
              { label: "Luật được thông qua", value: latest.lawsPassed.toString() },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Lịch sử thống kê</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Kỳ", "GDP", "Dân số", "Thu thuế", "Chi tiêu", "Công dân"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(stats as Record<string, number | string>[]).map(s => (
                <tr key={s.id as string} className="hover:bg-white/3 transition-colors">
                  <td className="py-2 px-3 text-white">{s.period as string}</td>
                  <td className="py-2 px-3 text-amber-400">{((s.gdp as number) / 1e9).toFixed(1)}B</td>
                  <td className="py-2 px-3 text-blue-400">{(s.population as number).toLocaleString()}</td>
                  <td className="py-2 px-3 text-green-400">{((s.taxRevenue as number) / 1e6).toFixed(1)}M</td>
                  <td className="py-2 px-3 text-red-400">{((s.spending as number) / 1e6).toFixed(1)}M</td>
                  <td className="py-2 px-3 text-purple-400">{(s.citizenCount as number).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.length === 0 && <p className="text-center text-muted-foreground py-4">Chưa có dữ liệu</p>}
        </div>
      </div>
    </div>
  );
}
