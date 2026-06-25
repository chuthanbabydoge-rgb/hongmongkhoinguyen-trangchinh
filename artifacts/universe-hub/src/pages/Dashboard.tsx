import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { InventorySummary } from "@/components/dashboard/InventorySummary";
import { UniverseModules } from "@/components/dashboard/UniverseModules";
import { RecentApps } from "@/components/dashboard/RecentApps";
import { FavoriteApps } from "@/components/dashboard/FavoriteApps";
import { MarketplaceStats } from "@/components/dashboard/MarketplaceStats";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const { wallet, loading } = useDashboard();

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 max-w-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <UserProfile />
            <WalletOverview wallet={wallet} loading={loading} />
            <InventorySummary />
            <MarketplaceStats />
            <RecentApps />
            <FavoriteApps />
            <div className="pt-4">
              <UniverseModules />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
