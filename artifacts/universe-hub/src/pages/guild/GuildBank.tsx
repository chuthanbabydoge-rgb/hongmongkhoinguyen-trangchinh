import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Coins, TrendingDown, Package } from "lucide-react";
import { guildService } from "@/services/guildService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

interface Props { params: { id: string } }

export default function GuildBank({ params }: Props) {
  const { id } = params;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [contributeForm, setContributeForm] = useState({ type: "CREDITS", amount: "", note: "" });
  const [withdrawForm, setWithdrawForm] = useState({ currency: "CREDITS", amount: "", note: "" });

  const { data: guild } = useQuery({ queryKey: ["guild", id], queryFn: () => guildService.getGuild(id) });
  const { data: txs = [] } = useQuery({ queryKey: ["guild-treasury", id], queryFn: () => guildService.getTreasury(id) });
  const { data: warehouse = [] } = useQuery({ queryKey: ["guild-warehouse", id], queryFn: () => guildService.getWarehouse(id) });
  const { data: contributions = [] } = useQuery({ queryKey: ["guild-contributions", id], queryFn: () => guildService.getContributions(id) });

  const contributeMutation = useMutation({
    mutationFn: () => guildService.contribute(id, { type: contributeForm.type as any, amount: Number(contributeForm.amount), note: contributeForm.note || undefined }),
    onSuccess: () => {
      toast({ title: "Đóng góp thành công!" });
      qc.invalidateQueries({ queryKey: ["guild", id] });
      qc.invalidateQueries({ queryKey: ["guild-treasury", id] });
      qc.invalidateQueries({ queryKey: ["guild-contributions", id] });
      setContributeForm(f => ({ ...f, amount: "", note: "" }));
    },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => guildService.withdrawTreasury(id, { currency: withdrawForm.currency, amount: Number(withdrawForm.amount), note: withdrawForm.note || undefined }),
    onSuccess: () => {
      toast({ title: "Rút kho bạc thành công!" });
      qc.invalidateQueries({ queryKey: ["guild", id] });
      qc.invalidateQueries({ queryKey: ["guild-treasury", id] });
      setWithdrawForm(f => ({ ...f, amount: "", note: "" }));
    },
    onError: (err: Error) => toast({ title: "Lỗi", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate(`/guild/${id}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> {guild?.name ?? "Guild"}
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><Coins className="w-5 h-5 text-primary" /> Kho Bạc & Kho Đồ</h1>

            {/* Treasury Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Treasury Credits</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">{(guild?.treasuryCredits ?? 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Treasury Coins</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{(guild?.treasuryCoins ?? 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contribute */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h2 className="font-semibold text-white mb-4">Đóng góp</h2>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Loại</Label>
                    <Select value={contributeForm.type} onValueChange={v => setContributeForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/10 h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREDITS">Credits</SelectItem>
                        <SelectItem value="COINS">Coins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Số lượng</Label>
                    <Input type="number" value={contributeForm.amount} onChange={e => setContributeForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs">Ghi chú</Label>
                    <Input value={contributeForm.note} onChange={e => setContributeForm(f => ({ ...f, note: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" placeholder="Tùy chọn" />
                  </div>
                  <Button size="sm" className="w-full" onClick={() => contributeMutation.mutate()} disabled={contributeMutation.isPending || !contributeForm.amount}>Đóng góp</Button>
                </div>
              </div>

              {/* Withdraw */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-400" /> Rút kho bạc</h2>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Loại tiền</Label>
                    <Select value={withdrawForm.currency} onValueChange={v => setWithdrawForm(f => ({ ...f, currency: v }))}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/10 h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREDITS">Credits</SelectItem>
                        <SelectItem value="COINS">Coins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Số lượng</Label>
                    <Input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs">Ghi chú</Label>
                    <Input value={withdrawForm.note} onChange={e => setWithdrawForm(f => ({ ...f, note: e.target.value }))} className="mt-1 bg-white/5 border-white/10 h-8 text-sm" placeholder="Tùy chọn" />
                  </div>
                  <Button size="sm" variant="destructive" className="w-full" onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending || !withdrawForm.amount}>Rút</Button>
                </div>
              </div>
            </div>

            {/* Warehouse */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-blue-400" /> Kho Đồ</h2>
              {warehouse.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kho trống.</p>
              ) : (
                <div className="space-y-2">
                  {warehouse.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm border-b border-white/5 last:border-0 py-2">
                      <span className="text-white">{item.itemName}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-4">Lịch sử giao dịch kho bạc</h2>
              {txs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có giao dịch.</p>
              ) : (
                <div className="space-y-2">
                  {txs.slice(0, 20).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between text-sm border-b border-white/5 last:border-0 py-2">
                      <div>
                        <span className={tx.type === "DEPOSIT" ? "text-green-400" : "text-red-400"}>{tx.type === "DEPOSIT" ? "+" : "-"}{tx.amount.toLocaleString()} {tx.currency}</span>
                        {tx.note && <span className="text-muted-foreground ml-2">— {tx.note}</span>}
                      </div>
                      <span className="text-muted-foreground text-xs">{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
