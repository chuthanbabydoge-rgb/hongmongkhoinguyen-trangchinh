import { Link, useLocation } from "wouter";
import { LayoutDashboard, ArrowLeftRight, Gift, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "../../context/WalletContext";

export function Sidebar() {
  const [location] = useLocation();
  const { balances } = useWallet();

  const mainLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/rewards", label: "Rewards", icon: Gift },
  ];

  return (
    <div className="w-64 border-r bg-card min-h-screen flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          FinVault
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-4 px-2">
          Overview
        </div>
        {mainLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid={`link-sidebar-${link.label.toLowerCase()}`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-8 px-2">
          Wallets
        </div>
        {balances.map((balance) => {
          const href = `/wallet/${balance.type}`;
          const isActive = location === href;
          return (
            <Link
              key={balance.type}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid={`link-sidebar-wallet-${balance.type}`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: balance.color }}
              />
              {balance.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
