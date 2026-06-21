import { userProfile } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Shield, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function UserProfile() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((userProfile.xp / userProfile.maxXp) * 100);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-xl relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
        
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-primary/40 p-1">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              {userProfile.initials}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-black border border-primary/50 px-2 py-1 rounded-md text-xs font-bold text-primary neon-glow-accent">
            LVL {userProfile.level}
          </div>
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-wider neon-text mb-1">
              {userProfile.username}
            </h1>
            <div className="flex items-center gap-4 text-sm font-medium tracking-widest text-muted-foreground uppercase">
              <span className="text-primary flex items-center gap-1.5"><Shield className="w-4 h-4" /> {userProfile.title}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span className="flex items-center gap-1.5 text-blue-400"><Star className="w-4 h-4" /> Trạng thái Ưu tú</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1 text-primary/80"><Zap className="w-3 h-3" /> KINH NGHIỆM</span>
              <span className="text-white">{userProfile.xp.toLocaleString()} / {userProfile.maxXp.toLocaleString()} XP</span>
            </div>
            <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000 ease-out shadow-[0_0_10px_hsl(var(--primary))]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
