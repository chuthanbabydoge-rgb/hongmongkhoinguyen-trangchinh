import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useWallet } from "../../context/WalletContext";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const { refreshWallet, isLoading } = useWallet();

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="text-sm font-medium text-muted-foreground">
            Wallet Manager
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshWallet()}
            disabled={isLoading}
            className="gap-2"
            data-testid="button-refresh"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
