import { useState } from "react";
import { useWalletTransactions } from "../hooks/useWalletSummary";
import { useWallet } from "../context/WalletContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { WalletType } from "../types/wallet";

export default function Transactions() {
  const [selectedTab, setSelectedTab] = useState<WalletType | "all">("all");
  const { balances } = useWallet();
  
  const transactions = useWalletTransactions(selectedTab === "all" ? undefined : selectedTab);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-1">Complete history across all your wallets.</p>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="w-full">
        <TabsList className="mb-4 inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="all" className="px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">All</TabsTrigger>
          {balances.map(b => (
            <TabsTrigger 
              key={b.type} 
              value={b.type}
              className="px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              data-testid={`tab-filter-${b.type}`}
            >
              {b.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card>
          <div className="divide-y">
            {transactions.map((txn) => {
              const isCredit = txn.direction === "credit";
              const walletBalance = balances.find(b => b.type === txn.walletType);
              
              return (
                <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors" data-testid={`row-transaction-${txn.id}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(txn.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        <span className="text-xs text-muted-foreground opacity-50">•</span>
                        <span className="text-[10px] uppercase font-semibold opacity-70" style={{ color: walletBalance?.color }}>
                          {walletBalance?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isCredit ? 'text-emerald-600' : 'text-foreground'}`}>
                      {isCredit ? '+' : '-'}{txn.amount.toLocaleString()} <span className="text-xs font-normal opacity-70">{walletBalance?.symbol}</span>
                    </p>
                    <Badge variant="outline" className={`mt-1 text-[10px] capitalize ${
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
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Search className="w-8 h-8 opacity-20 mb-4" />
                <p>No transactions found for this filter.</p>
              </div>
            )}
          </div>
        </Card>
      </Tabs>
    </div>
  );
}
