import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/context/WalletContext";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
