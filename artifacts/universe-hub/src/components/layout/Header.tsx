import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userProfile } from "@/data/mockData";

export function Header() {
  return (
    <header className="h-16 glass-panel border-b border-white/5 sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative hidden sm:block w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Tìm kiếm vũ trụ..." 
            className="pl-9 bg-black/40 border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 h-9 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse-slow shadow-[0_0_8px_hsl(var(--primary))]"></span>
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-white uppercase tracking-wider">{userProfile.username}</div>
            <div className="text-xs text-primary/80 uppercase tracking-widest">{userProfile.title}</div>
          </div>
          <Avatar className="h-9 w-9 border border-primary/30 neon-glow cursor-pointer hover:scale-105 transition-transform">
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600/80 text-white font-bold">
              {userProfile.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
