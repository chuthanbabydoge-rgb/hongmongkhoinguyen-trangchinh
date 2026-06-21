import { useWalletSummary } from "../hooks/useWalletSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { balances, recentTransactions, rewards } = useWalletSummary();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Your consolidated digital assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((balance) => (
          <Card 
            key={balance.type} 
            className="overflow-hidden relative group hover:shadow-md transition-all duration-300"
            data-testid={`card-balance-${balance.type}`}
          >
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: balance.color }} 
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                {balance.label}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs opacity-20 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: `${balance.color}20`, color: balance.color }}
                >
                  {balance.symbol}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balance.amount.toLocaleString(undefined, {
                  minimumFractionDigits: balance.amount % 1 === 0 ? 0 : 2,
                  maximumFractionDigits: 2,
                })}
                <span className="text-sm text-muted-foreground ml-1 font-normal">{balance.symbol}</span>
              </div>
            </CardContent>
            <Link href={`/wallet/${balance.type}`} className="absolute inset-0 z-10">
              <span className="sr-only">View {balance.label}</span>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Link href="/transactions" className="text-sm text-primary hover:underline" data-testid="link-view-all-transactions">
              View all
            </Link>
          </div>
          <Card>
            <div className="divide-y">
              {recentTransactions.map((txn) => {
                const isCredit = txn.direction === "credit";
                return (
                  <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors" data-testid={`row-transaction-${txn.id}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(txn.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isCredit ? 'text-emerald-600' : 'text-foreground'}`}>
                        {isCredit ? '+' : '-'}{txn.amount.toLocaleString()} <span className="text-xs font-normal opacity-70">{txn.walletType}</span>
                      </p>
                      <Badge variant="outline" className={`mt-1 text-[10px] capitalize ${
                        txn.status === 'completed' ? 'border-emerald-200 text-emerald-600' : 
                        txn.status === 'pending' ? 'border-amber-200 text-amber-600' : 
                        'border-rose-200 text-rose-600'
                      }`}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No recent transactions.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Rewards Program</h2>
          <Card className="bg-gradient-to-br from-card to-muted border-none shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <TrendingUp className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg uppercase">
                  {rewards.tier.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Tier</div>
                  <div className="text-xl font-bold capitalize">{rewards.tier}</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to {rewards.nextTier || 'Max'}</span>
                  <span className="font-medium">{rewards.currentPoints.toLocaleString()} PTS</span>
                </div>
                <Progress 
                  value={rewards.nextTier ? (rewards.currentPoints / (rewards.currentPoints + rewards.pointsToNextTier)) * 100 : 100} 
                  className="h-2" 
                />
                {rewards.nextTier && (
                  <p className="text-xs text-muted-foreground text-right">
                    {rewards.pointsToNextTier.toLocaleString()} more needed
                  </p>
                )}
              </div>

              <Link href="/rewards" className="w-full inline-flex justify-center items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors" data-testid="button-view-rewards">
                View Rewards ({rewards.availableRewards})
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
