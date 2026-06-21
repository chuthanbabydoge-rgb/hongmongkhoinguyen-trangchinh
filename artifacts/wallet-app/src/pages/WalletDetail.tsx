import { useParams } from "wouter";
import { useWallet } from "../context/WalletContext";
import { useWalletTransactions } from "../hooks/useWalletSummary";
import { WalletType } from "../types/wallet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import NotFound from "./not-found";

export default function WalletDetail() {
  const { type } = useParams<{ type: string }>();
  const { getBalance } = useWallet();
  
  // Validate type
  if (!type || !["credits", "coins", "tokens", "rewardPoints"].includes(type)) {
    return <NotFound />;
  }

  const walletType = type as WalletType;
  const balance = getBalance(walletType);
  const transactions = useWalletTransactions(walletType);

  if (!balance) return <NotFound />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="overflow-hidden relative border-none shadow-md bg-gradient-to-br from-card to-muted">
        <div 
          className="absolute top-0 left-0 w-full h-2" 
          style={{ backgroundColor: balance.color }} 
        />
        <div className="p-8 md:p-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {balance.label} Balance
          </p>
          <div className="flex items-baseline gap-2">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight" style={{ color: balance.color }}>
              {balance.amount.toLocaleString(undefined, {
                minimumFractionDigits: balance.amount % 1 === 0 ? 0 : 2,
                maximumFractionDigits: 2,
              })}
            </h1>
            <span className="text-2xl text-muted-foreground font-medium">{balance.symbol}</span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <Card>
          <div className="divide-y">
            {transactions.map((txn) => {
              const isCredit = txn.direction === "credit";
              return (
                <div key={txn.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors" data-testid={`row-wallet-transaction-${txn.id}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isCredit ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-base font-medium">{txn.description}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {format(new Date(txn.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                      {txn.reference && (
                        <p className="text-xs text-muted-foreground/60 mt-1 font-mono">Ref: {txn.reference}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isCredit ? 'text-emerald-600' : 'text-foreground'}`}>
                      {isCredit ? '+' : '-'}{txn.amount.toLocaleString()} <span className="text-sm font-normal opacity-70">{balance.symbol}</span>
                    </p>
                    <Badge variant="outline" className={`mt-2 capitalize ${
                      txn.status === 'completed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 
                      txn.status === 'pending' ? 'border-amber-200 text-amber-600 bg-amber-50' : 
                      'border-rose-200 text-rose-600 bg-rose-50'
                    }`}>
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            {transactions.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No transactions found for this wallet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
