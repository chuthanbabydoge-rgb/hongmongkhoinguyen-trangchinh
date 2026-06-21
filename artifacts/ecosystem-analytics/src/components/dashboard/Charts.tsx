import React from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ComposedChart
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ['#00f0ff', '#b026ff', '#00ff66', '#ff007f', '#ffd700'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-white font-mono text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white font-mono font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function ChartCard({ title, children, delay = 0, className = "" }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card p-6 flex flex-col ${className}`}
    >
      <h3 className="text-lg font-medium text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        {title}
      </h3>
      <div className="flex-1 w-full min-h-[250px]">
        {children}
      </div>
    </motion.div>
  );
}

export function UserGrowthChart({ data }: { data: any[] }) {
  return (
    <ChartCard title="User Growth (Millions)" delay={0.2}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="users" name="Users (M)" stroke="#00f0ff" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#00f0ff', stroke: '#000', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AssetDistributionChart({ data }: { data: any[] }) {
  return (
    <ChartCard title="Asset Distribution" delay={0.3}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            {entry.name}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function TransactionVolumeChart({ data }: { data: any[] }) {
  return (
    <ChartCard title="Tx Volume (Millions)" delay={0.4}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="volume" name="Volume (M)" fill="#b026ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ActiveUsersRegionChart({ data }: { data: any[] }) {
  return (
    <ChartCard title="Active Users by Region" delay={0.5}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="region" stroke="rgba(255,255,255,0.7)" fontSize={11} tickLine={false} axisLine={false} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="users" name="Users" fill="#00ff66" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DauTrendChart({ data }: { data: any[] }) {
  return (
    <ChartCard title="DAU Trend (30 Days)" delay={0.6} className="md:col-span-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <defs>
            <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff007f" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff007f" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `D${val}`} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="dau" name="DAU" stroke="#ff007f" strokeWidth={2} fillOpacity={1} fill="url(#colorDau)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopMetricsChart({ data }: { data: any[] }) {
  return (
    <ChartCard title="Macro Trends (Quarterly)" delay={0.7} className="md:col-span-2 lg:col-span-3">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar yAxisId="right" dataKey="transactions" name="Tx (M)" fill="rgba(176, 38, 255, 0.3)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="left" type="monotone" dataKey="users" name="Users (M)" stroke="#00f0ff" strokeWidth={3} dot={{ r: 4 }} />
          <Line yAxisId="left" type="monotone" dataKey="assets" name="Assets (M)" stroke="#00ff66" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
