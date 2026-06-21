import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Users, Layers, Globe, Shield, Cat, Activity 
} from "lucide-react";
import { 
  getEcosystemStats, EcosystemStats,
  getUserGrowthData, getAssetDistributionData,
  getTransactionVolumeData, getActiveUsersByRegionData,
  getDauTrendData, getTopMetricsData
} from "@/lib/api";
import { 
  UserGrowthChart, AssetDistributionChart, 
  TransactionVolumeChart, ActiveUsersRegionChart,
  DauTrendChart, TopMetricsChart
} from "@/components/dashboard/Charts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [chartData, setChartData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          statsData, growth, distribution, volume, region, dau, top
        ] = await Promise.all([
          getEcosystemStats(),
          getUserGrowthData(),
          getAssetDistributionData(),
          getTransactionVolumeData(),
          getActiveUsersByRegionData(),
          getDauTrendData(),
          getTopMetricsData()
        ]);
        
        setStats(statsData);
        setChartData({ growth, distribution, volume, region, dau, top });
      } catch (error) {
        console.error("Failed to load ecosystem data", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-primary font-mono tracking-widest animate-pulse">ĐANG KHỞI ĐỘNG HỆ THỐNG...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative pb-20">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2 font-mono">Trung tâm Điều khiển</h2>
          <p className="text-muted-foreground font-mono text-sm">Đo lường thời gian thực và phân tích hệ sinh thái</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard 
            title="Tổng người dùng" 
            value={stats.totalUsers} 
            change={stats.changes.users} 
            icon={<Users className="w-5 h-5" />}
            delay={0.1}
          />
          <StatCard 
            title="Tổng tài sản" 
            value={stats.totalAssets} 
            change={stats.changes.assets} 
            icon={<Layers className="w-5 h-5" />}
            delay={0.2}
          />
          <StatCard 
            title="Thế giới hoạt động" 
            value={stats.totalWorlds} 
            change={stats.changes.worlds} 
            icon={<Globe className="w-5 h-5" />}
            delay={0.3}
          />
          <StatCard 
            title="CLB Bóng đá" 
            value={stats.totalFootballClubs} 
            change={stats.changes.footballClubs} 
            icon={<Shield className="w-5 h-5" />}
            delay={0.4}
          />
          <StatCard 
            title="Thú cưng số" 
            value={stats.totalPets} 
            change={stats.changes.pets} 
            icon={<Cat className="w-5 h-5" />}
            delay={0.5}
          />
          <StatCard 
            title="Giao dịch" 
            value={stats.totalTransactions} 
            change={stats.changes.transactions} 
            icon={<Activity className="w-5 h-5" />}
            delay={0.6}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <UserGrowthChart data={chartData.growth} />
          <AssetDistributionChart data={chartData.distribution} />
          <TransactionVolumeChart data={chartData.volume} />
          
          <ActiveUsersRegionChart data={chartData.region} />
          <DauTrendChart data={chartData.dau} />
        </div>
        
        <div className="grid grid-cols-1 mb-10">
          <TopMetricsChart data={chartData.top} />
        </div>
      </main>
    </div>
  );
}
