import { useQuery } from "@tanstack/react-query";
import { Settings, Globe, Flag, Building2, Info } from "lucide-react";

export default function CountrySettings() {
  const { data: nation, isLoading } = useQuery({
    queryKey: ["nation-info"],
    queryFn: () => fetch("/api/nation").then(r => r.json()).then(r => r.data),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải...</div>;
  if (!nation) return <div className="text-center py-8 text-muted-foreground">Không tìm thấy thông tin quốc gia</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Settings className="w-7 h-7 text-gray-400" />
        <h1 className="text-2xl font-bold text-white">Thông tin Quốc gia</h1>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-6 text-center">
        <div className="text-6xl mb-3">{nation.flag}</div>
        <h2 className="text-2xl font-bold text-white">{nation.officialName}</h2>
        <p className="text-indigo-300 italic mt-1">"{nation.motto}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Thủ đô", value: nation.capital, icon: Building2 },
          { label: "Ngôn ngữ", value: nation.language, icon: Globe },
          { label: "Đơn vị tiền tệ", value: nation.currency, icon: Flag },
          { label: "Quốc ca", value: nation.anthem, icon: Info },
          { label: "Trạng thái", value: nation.status, icon: Info },
          { label: "Ngày thành lập", value: new Date(nation.foundedAt).toLocaleDateString("vi-VN"), icon: Info },
        ].map(item => (
          <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3">Mô tả</h3>
        <p className="text-sm text-muted-foreground">{nation.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Dân số", value: Number(nation.population).toLocaleString(), color: "text-blue-400" },
          { label: "Diện tích", value: `${Number(nation.area).toLocaleString()} km²`, color: "text-green-400" },
          { label: "GDP", value: `${(Number(nation.gdp) / 1e9).toFixed(1)}B UNI`, color: "text-amber-400" },
        ].map(item => (
          <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
