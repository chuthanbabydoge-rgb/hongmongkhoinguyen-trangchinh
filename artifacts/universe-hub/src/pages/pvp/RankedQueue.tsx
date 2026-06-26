import { useState } from "react";
import { useLocation } from "wouter";
import { Zap, Clock, Users, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MATCH_TYPES = [
  { value: "DUEL",       label: "Tay đôi (1v1)",  size: "2 người",  icon: "⚔️" },
  { value: "ARENA_2V2",  label: "Đấu nhóm 2v2",   size: "4 người",  icon: "🛡️" },
  { value: "ARENA_3V3",  label: "Đấu nhóm 3v3",   size: "6 người",  icon: "🏟️" },
  { value: "ARENA_5V5",  label: "Chiến trường 5v5",size: "10 người", icon: "⚡" },
];

export default function RankedQueue() {
  const { accessToken } = useAuth();
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState("DUEL");
  const [isRanked, setIsRanked] = useState(true);
  const [joining, setJoining] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleJoinQueue = async () => {
    if (!accessToken) return;
    setJoining(true); setError(null);
    try {
      const r = await fetch("/api/pvp/queue", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ matchType: selectedType, isRanked }),
      });
      const j = await r.json() as { ok: boolean; error?: string };
      if (!j.ok) { setError(j.error ?? "Lỗi không xác định"); return; }
      setInQueue(true);
      const start = Date.now();
      const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
      setTimeout(() => { clearInterval(timer); }, 300000); // 5 min max
    } catch (e) {
      setError("Không thể kết nối server");
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!accessToken) return;
    await fetch("/api/pvp/queue", { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    setInQueue(false); setElapsed(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate("/pvp")} className="text-muted-foreground text-sm hover:text-white transition-colors mb-4 flex items-center gap-1">
          ← Quay lại PvP
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-400" /> Tìm trận PvP
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Hệ thống MMR tự động ghép cặp người chơi cùng trình độ</p>
      </div>

      {inQueue ? (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Đang tìm trận...</h2>
            <p className="text-muted-foreground text-sm mt-1">{MATCH_TYPES.find((t) => t.value === selectedType)?.label}</p>
          </div>
          <div className="text-4xl font-mono font-bold text-blue-400">{formatTime(elapsed)}</div>
          <p className="text-xs text-muted-foreground">Hệ thống đang tìm đối thủ phù hợp với MMR của bạn</p>
          <button
            onClick={handleLeaveQueue}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            Hủy tìm trận
          </button>
        </div>
      ) : (
        <>
          {/* Match type selection */}
          <div>
            <label className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest mb-3 block">Chế độ</label>
            <div className="grid grid-cols-2 gap-3">
              {MATCH_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedType === t.value
                      ? "border-blue-500/60 bg-blue-500/10"
                      : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" /> {t.size}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ranked toggle */}
          <div className="flex items-center justify-between p-4 bg-white/3 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm font-medium">Trận xếp hạng</div>
                <div className="text-xs text-muted-foreground">Ảnh hưởng đến MMR và thứ hạng mùa</div>
              </div>
            </div>
            <button
              onClick={() => setIsRanked((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isRanked ? "bg-blue-600" : "bg-white/10"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isRanked ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
          )}

          <button
            onClick={handleJoinQueue}
            disabled={joining}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {joining ? "Đang tham gia..." : "Tìm trận ngay"}
          </button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            Thời gian chờ trung bình: ~30 giây
          </div>
        </>
      )}
    </div>
  );
}
