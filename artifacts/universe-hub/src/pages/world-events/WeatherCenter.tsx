import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Cloud, Sun, Snowflake, Wind, CloudRain, Sparkles, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const WEATHER_TYPES = ["SUNNY", "RAIN", "SNOW", "STORM", "FOG", "MAGIC"];
const WEATHER_ICONS: Record<string, string> = {
  SUNNY: "☀️", RAIN: "🌧️", SNOW: "❄️", STORM: "⛈️", FOG: "🌫️", MAGIC: "✨",
};
const WEATHER_COLORS: Record<string, string> = {
  SUNNY: "text-yellow-400", RAIN: "text-blue-400", SNOW: "text-cyan-400",
  STORM: "text-purple-400", FOG: "text-gray-400", MAGIC: "text-pink-400",
};
const WEATHER_DESCRIPTIONS: Record<string, string> = {
  SUNNY: "Trời nắng đẹp — tốc độ di chuyển tăng 10%",
  RAIN: "Mưa rào — tầm nhìn giảm, tốc độ giảm 5%",
  SNOW: "Tuyết rơi — mana hồi phục nhanh hơn",
  STORM: "Bão lớn — sát thương sấm sét tăng 20%",
  FOG: "Sương mù — cơ hội né tránh tăng 15%",
  MAGIC: "Dòng ma thuật — mọi phép thuật mạnh hơn 25%",
};

export default function WeatherCenter() {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [newWeather, setNewWeather] = useState("SUNNY");

  const { data: weathersRes } = useQuery({
    queryKey: ["all-weather"],
    queryFn: () => fetch("/api/weather/all").then(r => r.json()),
    refetchInterval: 30000,
  });

  const { data: currentRes } = useQuery({
    queryKey: ["weather", selectedRegion],
    queryFn: () => fetch(`/api/weather?region=${selectedRegion}`).then(r => r.json()),
    refetchInterval: 10000,
  });

  const weathers = weathersRes?.data ?? [];
  const current = currentRes?.data;

  const setWeatherMutation = useMutation({
    mutationFn: () => fetch("/api/weather", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ region: selectedRegion, weather: newWeather, intensity: 1.0, durationSec: 3600 }),
    }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.ok) {
        qc.invalidateQueries({ queryKey: ["all-weather"] });
        qc.invalidateQueries({ queryKey: ["weather", selectedRegion] });
        toast({ title: `Thời tiết tại ${selectedRegion} đã chuyển sang ${newWeather}!` });
      } else toast({ title: d.error as string, variant: "destructive" });
    },
  });

  const REGIONS = ["global", "Sa Mạc Thiên Hà", "Vùng Cực Bắc", "Đồng Bằng Sét", "Vùng Hắc Ám"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Cloud className="w-5 h-5 text-blue-400" />
        <h1 className="text-xl font-bold text-white">Trung Tâm Thời Tiết</h1>
      </div>

      {/* Current Weather */}
      {current && (
        <Card className="bg-blue-900/10 border-blue-500/30">
          <CardHeader><CardTitle className="text-sm text-blue-400">Thời tiết hiện tại — {current.region}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{WEATHER_ICONS[current.weather as string] ?? "☀️"}</span>
              <div>
                <p className={`text-2xl font-bold ${WEATHER_COLORS[current.weather as string] ?? "text-white"}`}>{current.weather}</p>
                <p className="text-gray-300 text-sm mt-1">{WEATHER_DESCRIPTIONS[current.weather as string]}</p>
                <p className="text-gray-400 text-xs mt-1">Cường độ: {current.intensity} • {current.endsAt ? `Hết lúc: ${new Date(current.endsAt).toLocaleTimeString("vi-VN")}` : "Vô thời hạn"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Weather */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader><CardTitle className="text-sm text-gray-300">Thay đổi thời tiết</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
            <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-3 gap-2">
            {WEATHER_TYPES.map(w => (
              <button key={w} onClick={() => setNewWeather(w)}
                className={`p-3 rounded-lg border text-center text-xs font-semibold transition-colors ${newWeather === w ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"}`}>
                <div className="text-xl mb-1">{WEATHER_ICONS[w]}</div>{w}
              </button>
            ))}
          </div>
          <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-500" onClick={() => setWeatherMutation.mutate()} disabled={setWeatherMutation.isPending}>
            <Cloud className="w-4 h-4" />Áp dụng thời tiết
          </Button>
        </CardContent>
      </Card>

      {/* All Regions Weather */}
      {weathers.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader><CardTitle className="text-sm text-gray-300">Thời tiết toàn bộ vùng</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {weathers.map((w: { id: string; region: string; weather: string; intensity: number }) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{WEATHER_ICONS[w.weather] ?? "☀️"}</span>
                  <p className="text-white text-sm">{w.region}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${WEATHER_COLORS[w.weather] ?? "text-gray-400"}`}>{w.weather}</span>
                  <span className="text-gray-400 text-xs">x{w.intensity}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
