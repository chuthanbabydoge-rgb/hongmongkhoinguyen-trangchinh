import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/context/WalletContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import UniverseMap from "@/pages/UniverseMap";
import ServiceRegistry from "@/pages/ServiceRegistry";
import ModuleRegistry from "@/pages/ModuleRegistry";
import EcosystemArchitecture from "@/pages/EcosystemArchitecture";
import WalletDashboard from "@/pages/wallet/WalletDashboard";
import Transactions from "@/pages/wallet/Transactions";
import Rewards from "@/pages/wallet/Rewards";
import WalletAnalytics from "@/pages/wallet/WalletAnalytics";
import CreateTransaction from "@/pages/wallet/CreateTransaction";
import InventoryDashboard from "@/pages/inventory/InventoryDashboard";
import Pets from "@/pages/inventory/Pets";
import FootballPlayers from "@/pages/inventory/FootballPlayers";
import WorldAssets from "@/pages/inventory/WorldAssets";
import Tickets from "@/pages/inventory/Tickets";
import Items from "@/pages/inventory/Items";
import InventoryAnalytics from "@/pages/inventory/InventoryAnalytics";
import WarehouseManager from "@/pages/inventory/WarehouseManager";
import InventoryItemDetail from "@/pages/inventory/InventoryItemDetail";
import MarketplaceDashboard from "@/pages/marketplace/MarketplaceDashboard";
import Listings from "@/pages/marketplace/Listings";
import Auctions from "@/pages/marketplace/Auctions";
import MarketplaceTransactions from "@/pages/marketplace/MarketplaceTransactions";
import MarketplaceAnalytics from "@/pages/marketplace/MarketplaceAnalytics";
import Trades from "@/pages/marketplace/Trades";
import WatchlistPage from "@/pages/marketplace/Watchlist";
import ActivityFeed from "@/pages/marketplace/ActivityFeed";
import Launcher from "@/pages/Launcher";
import AppDetail from "@/pages/AppDetail";
import Leaderboard from "@/pages/Leaderboard";
import AchievementsPage from "@/pages/Achievements";
import Social from "@/pages/Social";
import SocialProfile from "@/pages/SocialProfile";
import GuildDashboard from "@/pages/guild/GuildDashboard";
import GuildList from "@/pages/guild/GuildList";
import GuildCreate from "@/pages/guild/GuildCreate";
import GuildDetail from "@/pages/guild/GuildDetail";
import GuildMembers from "@/pages/guild/GuildMembers";
import GuildBank from "@/pages/guild/GuildBank";
import GuildEvents from "@/pages/guild/GuildEvents";
import GuildRankings from "@/pages/guild/GuildRankings";
import GuildLogs from "@/pages/guild/GuildLogs";
import GuildSettings from "@/pages/guild/GuildSettings";
import QuestsDashboard from "@/pages/quests/QuestsDashboard";
import MailDashboard from "@/pages/mail/MailDashboard";
import ChatHome from "@/pages/chat/ChatHome";
import ChatRoom from "@/pages/chat/ChatRoom";
import WorldDashboard from "@/pages/worlds/WorldDashboard";
import WorldExplorer from "@/pages/worlds/WorldExplorer";
import WorldDetail from "@/pages/worlds/WorldDetail";
import WorldCreate from "@/pages/worlds/WorldCreate";
import WorldEdit from "@/pages/worlds/WorldEdit";
import FeaturedWorlds from "@/pages/worlds/FeaturedWorlds";
import PopularWorlds from "@/pages/worlds/PopularWorlds";
import WorldBookmarks from "@/pages/worlds/WorldBookmarks";
import WorldTravelHistory from "@/pages/worlds/WorldTravelHistory";
import AiDashboard from "@/pages/ai/AiDashboard";
import AiChat from "@/pages/ai/AiChat";
import AiMemory from "@/pages/ai/AiMemory";
import AiSuggestions from "@/pages/ai/AiSuggestions";
import AiSettings from "@/pages/ai/AiSettings";
import CraftDashboard   from "@/pages/crafting/CraftDashboard";
import RecipeBrowser    from "@/pages/crafting/RecipeBrowser";
import CraftQueue       from "@/pages/crafting/CraftQueue";
import CraftHistory     from "@/pages/crafting/CraftHistory";
import Blueprints       from "@/pages/crafting/Blueprints";
import UpgradeCenter    from "@/pages/crafting/UpgradeCenter";
import EnchantCenter    from "@/pages/crafting/EnchantCenter";
import ResourceMap      from "@/pages/resources/ResourceMap";
import Gathering        from "@/pages/resources/Gathering";
import NPCShop          from "@/pages/shops/NPCShop";
import EconomyDashboard from "@/pages/economy/EconomyDashboard";
import MarketPrices     from "@/pages/economy/MarketPrices";
import { useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/map" component={UniverseMap} />
      <Route path="/services" component={ServiceRegistry} />
      <Route path="/modules" component={ModuleRegistry} />
      <Route path="/architecture" component={EcosystemArchitecture} />
      <Route path="/wallet" component={WalletDashboard} />
      <Route path="/wallet/transactions" component={Transactions} />
      <Route path="/wallet/rewards" component={Rewards} />
      <Route path="/wallet/analytics" component={WalletAnalytics} />
      <Route path="/wallet/create" component={CreateTransaction} />
      <Route path="/inventory" component={InventoryDashboard} />
      <Route path="/inventory/pets" component={Pets} />
      <Route path="/inventory/football" component={FootballPlayers} />
      <Route path="/inventory/world-assets" component={WorldAssets} />
      <Route path="/inventory/tickets" component={Tickets} />
      <Route path="/inventory/items" component={Items} />
      <Route path="/inventory/analytics" component={InventoryAnalytics} />
      <Route path="/inventory/warehouse" component={WarehouseManager} />
      <Route path="/inventory/:id" component={InventoryItemDetail} />
      <Route path="/marketplace" component={MarketplaceDashboard} />
      <Route path="/marketplace/listings" component={Listings} />
      <Route path="/marketplace/auctions" component={Auctions} />
      <Route path="/marketplace/transactions" component={MarketplaceTransactions} />
      <Route path="/marketplace/analytics" component={MarketplaceAnalytics} />
      <Route path="/marketplace/trades" component={Trades} />
      <Route path="/marketplace/watchlist" component={WatchlistPage} />
      <Route path="/marketplace/activity" component={ActivityFeed} />
      <Route path="/launcher" component={Launcher} />
      <Route path="/apps/:slug" component={AppDetail} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/achievements" component={AchievementsPage} />
      <Route path="/social/profile/:userId" component={SocialProfile} />
      <Route path="/social/:rest*" component={Social} />
      <Route path="/social" component={Social} />
      <Route path="/guild" component={GuildDashboard} />
      <Route path="/guild/list" component={GuildList} />
      <Route path="/guild/create" component={GuildCreate} />
      <Route path="/guild/rankings" component={GuildRankings} />
      <Route path="/guild/:id/members" component={GuildMembers} />
      <Route path="/guild/:id/bank" component={GuildBank} />
      <Route path="/guild/:id/events" component={GuildEvents} />
      <Route path="/guild/:id/logs" component={GuildLogs} />
      <Route path="/guild/:id/settings" component={GuildSettings} />
      <Route path="/guild/:id" component={GuildDetail} />
      <Route path="/quests" component={QuestsDashboard} />
      <Route path="/mail" component={MailDashboard} />
      <Route path="/chat" component={ChatHome} />
      <Route path="/chat/:id" component={ChatRoom} />
      <Route path="/worlds" component={WorldDashboard} />
      <Route path="/worlds/explorer" component={WorldExplorer} />
      <Route path="/worlds/featured" component={FeaturedWorlds} />
      <Route path="/worlds/popular" component={PopularWorlds} />
      <Route path="/worlds/bookmarks" component={WorldBookmarks} />
      <Route path="/worlds/history" component={WorldTravelHistory} />
      <Route path="/worlds/create" component={WorldCreate} />
      <Route path="/worlds/:id/edit" component={WorldEdit} />
      <Route path="/worlds/:id" component={WorldDetail} />
      <Route path="/ai" component={AiDashboard} />
      <Route path="/ai/chat/:id" component={AiChat} />
      <Route path="/ai/chat" component={AiChat} />
      <Route path="/ai/memory" component={AiMemory} />
      <Route path="/ai/suggestions" component={AiSuggestions} />
      <Route path="/ai/settings" component={AiSettings} />
      <Route path="/crafting" component={CraftDashboard} />
      <Route path="/crafting/recipes" component={RecipeBrowser} />
      <Route path="/crafting/queue" component={CraftQueue} />
      <Route path="/crafting/history" component={CraftHistory} />
      <Route path="/crafting/blueprints" component={Blueprints} />
      <Route path="/crafting/upgrade" component={UpgradeCenter} />
      <Route path="/crafting/enchant" component={EnchantCenter} />
      <Route path="/resources" component={ResourceMap} />
      <Route path="/resources/gather" component={Gathering} />
      <Route path="/shops" component={NPCShop} />
      <Route path="/economy" component={EconomyDashboard} />
      <Route path="/economy/prices" component={MarketPrices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true } as never);
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <LoginPage key="login" />;
  }
  return <Router key="app" />;
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WalletProvider>
            <InventoryProvider>
              <MarketplaceProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <AppContent />
                </WouterRouter>
                <Toaster />
              </MarketplaceProvider>
            </InventoryProvider>
          </WalletProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
