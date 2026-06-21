import React, { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  delay?: number;
}

export function StatCard({ title, value, change, icon, delay = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Simple count up animation
  useEffect(() => {
    const duration = 1000; // ms
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);

  const isPositive = change >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card neon-border-gradient p-6 group hover:neon-glow-cyan transition-all duration-500"
      data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{title}</h3>
        <div className="p-2 rounded-lg bg-white/5 text-primary">
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white font-mono neon-text-cyan">
          {formatNumber(displayValue)}
        </h2>
        
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-destructive'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          <span>{Math.abs(change)}% this month</span>
        </div>
      </div>
      
      {/* Decorative tech lines */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
    </motion.div>
  );
}
