import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Loader2, Star, BarChart2, FileText } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface Player { id: string; name: string; position?: string; nationality?: string; dateOfBirth?: string; number?: number; photo?: string; isActive: boolean; }
interface PlayerStatistic { matchesPlayed: number; goals: number; assists: number; yellowCards: number; redCards: number; minutesPlayed: number; rating: number; }
interface Contract { id: string; teamId: string; startDate: string; endDate: string; salary: number; status: string; }
interface Transfer { id: string; fromTeamId?: string; toTeamId?: string; fee: number; transferDate: string; }

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: playerData, isLoading } = useQuery<{ ok: boolean; data: Player }>({
    queryKey: ["sports", "player", id],
    queryFn: async () => (await fetch(`/api/sports/players/${id}`)).json() as Promise<{ ok: boolean; data: Player }>,
  });

  const { data: statsData } = useQuery<{ ok: boolean; data: PlayerStatistic }>({
    queryKey: ["sports", "player-stats", id],
    queryFn: async () => (await fetch(`/api/sports/players/${id}/statistics`)).json() as Promise<{ ok: boolean; data: PlayerStatistic }>,
  });

  const { data: contractData } = useQuery<{ ok: boolean; data: Contract }>({
    queryKey: ["sports", "contract", id],
    queryFn: async () => (await fetch(`/api/sports/contracts/player/${id}`)).json() as Promise<{ ok: boolean; data: Contract }>,
  });

  const { data: transfersData } = useQuery<{ ok: boolean; data: Transfer[] }>({
    queryKey: ["sports", "transfers", id],
    queryFn: async () => (await fetch(`/api/sports/transfers?playerId=${id}`)).json() as Promise<{ ok: boolean; data: Transfer[] }>,
  });

  const player = playerData?.data;
  const stats = statsData?.data;
  const contract = contractData?.data;
  const transfers = transfersData?.data ?? [];

  if (isLoading) return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <Link href="/sports/players" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />Danh sách cầu thủ
          </Link>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center text-4xl font-bold text-purple-400">
                {player?.number ?? "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{player?.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {player?.position && <span className="text-sm text-muted-foreground">{player.position}</span>}
                  {player?.nationality && <span className="text-sm text-muted-foreground">🌍 {player.nationality}</span>}
                  <div className={`text-xs px-2 py-0.5 rounded-full ${player?.isActive ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted-foreground"}`}>
                    {player?.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                {player?.dateOfBirth && <div className="text-sm text-muted-foreground mt-1">DOB: {player.dateOfBirth}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistics */}
            {stats && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" />Thống kê mùa giải</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Trận đấu", value: stats.matchesPlayed, color: "text-white" },
                    { label: "Bàn thắng", value: stats.goals, color: "text-green-400" },
                    { label: "Kiến tạo", value: stats.assists, color: "text-blue-400" },
                    { label: "Thẻ vàng", value: stats.yellowCards, color: "text-yellow-400" },
                    { label: "Thẻ đỏ", value: stats.redCards, color: "text-red-400" },
                    { label: "Phút chơi", value: stats.minutesPlayed, color: "text-white" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white font-medium">Đánh giá: {stats.rating.toFixed(1)}</span>
                </div>
              </div>
            )}

            {/* Contract */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-orange-400" />Hợp đồng</h2>
              {contract ? (
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Đội</span><span className="text-sm text-white">{contract.teamId.substring(0, 12)}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Bắt đầu</span><span className="text-sm text-white">{new Date(contract.startDate).toLocaleDateString("vi-VN")}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Hết hạn</span><span className="text-sm text-white">{new Date(contract.endDate).toLocaleDateString("vi-VN")}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Lương</span><span className="text-sm text-green-400">${contract.salary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Trạng thái</span><span className={`text-xs px-2 py-0.5 rounded-full ${contract.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-muted-foreground"}`}>{contract.status}</span></div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">Không có hợp đồng hiện tại</div>
              )}

              {/* Transfers */}
              {transfers.length > 0 && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Lịch sử chuyển nhượng</h3>
                  <div className="space-y-2">
                    {transfers.slice(0, 3).map((t) => (
                      <div key={t.id} className="text-xs text-muted-foreground flex justify-between">
                        <span>{new Date(t.transferDate).toLocaleDateString("vi-VN")}</span>
                        <span className="text-green-400">${t.fee.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
