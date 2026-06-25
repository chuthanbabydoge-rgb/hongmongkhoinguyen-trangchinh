import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Link, useLocation } from "wouter";
import { Users, UserPlus, UserCheck, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch, Route } from "wouter";
import SocialFriends from "./SocialFriends";
import SocialFollowers from "./SocialFollowers";
import SocialFollowing from "./SocialFollowing";
import SocialSearch from "./SocialSearch";

const TAB_NAV = [
  { label: "Bạn bè",        icon: UserCheck, path: "/social/friends"   },
  { label: "Người theo dõi",icon: Users,     path: "/social/followers" },
  { label: "Đang theo dõi", icon: UserPlus,  path: "/social/following" },
  { label: "Tìm kiếm",      icon: Search,    path: "/social/search"    },
];

function SocialNav() {
  const [location] = useLocation();
  return (
    <div className="flex gap-1 border-b border-white/5 mb-6">
      {TAB_NAV.map(({ label, icon: Icon, path }) => {
        const active = location === path || location.startsWith(path);
        return (
          <Link key={path} href={path}>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-white",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Social() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Universe Social
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kết nối với người chơi trong hệ sinh thái Universe
              </p>
            </div>
            <SocialNav />
            <Switch>
              <Route path="/social/friends"   component={SocialFriends}   />
              <Route path="/social/followers" component={SocialFollowers} />
              <Route path="/social/following" component={SocialFollowing} />
              <Route path="/social/search"    component={SocialSearch}    />
              <Route component={SocialFriends} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}
