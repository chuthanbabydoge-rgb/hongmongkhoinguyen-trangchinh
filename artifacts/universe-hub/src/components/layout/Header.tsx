import { Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/hooks/useAccount";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export function Header() {
  const { profile, avatar, loading } = useAccount();

  const initials = avatar?.initials ?? profile?.username?.slice(0, 2).toUpperCase() ?? "..";
  const displayName = profile?.username ?? "";
  const displayTitle = profile?.title ?? "";

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

      <div className="flex items-center gap-2">
        {/* Notification bell with dropdown */}
        <NotificationDropdown />

        {/* User identity */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-white/10">
          <div className="text-right hidden md:block">
            {loading ? (
              <>
                <div className="h-3.5 w-32 rounded bg-white/10 animate-pulse mb-1" />
                <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-white uppercase tracking-wider">
                  {displayName}
                </div>
                <div className="text-xs text-primary/80 uppercase tracking-widest">
                  {displayTitle}
                </div>
              </>
            )}
          </div>

          <Avatar className="h-9 w-9 border border-primary/30 neon-glow cursor-pointer hover:scale-105 transition-transform">
            {avatar?.imageUrl && <AvatarImage src={avatar.imageUrl} alt={displayName} />}
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-purple-600/80 text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
