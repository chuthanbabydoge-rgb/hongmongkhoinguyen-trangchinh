import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  MessageSquare,
  Plus,
  Search,
  Users,
  Globe,
  Lock,
  Shield,
  ShoppingBag,
  Settings,
  Loader2,
  ChevronRight,
  Pin,
  X,
} from "lucide-react";
import {
  useMyRooms,
  useChatDashboard,
  useCreateRoom,
  useJoinRoom,
  useChatRealtime,
  getRoomTypeIcon,
  getRoomTypeLabel,
  formatMessageTime,
  type ChatRoom,
  type ChatRoomType,
} from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TYPE_FILTER_TABS: { type: ChatRoomType | "ALL"; label: string; icon: typeof Globe }[] = [
  { type: "ALL",         label: "Tất cả",     icon: MessageSquare },
  { type: "PRIVATE",     label: "Riêng tư",   icon: Lock },
  { type: "GUILD",       label: "Guild",      icon: Shield },
  { type: "GLOBAL",      label: "Toàn cầu",   icon: Globe },
  { type: "MARKETPLACE", label: "Chợ",        icon: ShoppingBag },
];

export default function ChatHome() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [filter, setFilter] = useState<ChatRoomType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", type: "GLOBAL" as ChatRoomType, isPublic: true, description: "" });

  const { data: rooms = [], isLoading, refetch } = useMyRooms();
  const { data: dashboard } = useChatDashboard();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  // Resolve userId from access token claim (simple decode)
  const userId = accessToken ? (() => { try { return JSON.parse(atob(accessToken.split(".")[1]!))?.sub; } catch { return undefined; } })() : undefined;

  useChatRealtime(userId, undefined, () => { refetch(); });

  const filtered = rooms.filter((r) => {
    if (filter !== "ALL" && r.type !== filter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleCreateRoom() {
    if (!newRoom.name.trim()) { toast({ title: "Tên phòng là bắt buộc", variant: "destructive" }); return; }
    try {
      const room = await createRoom.mutateAsync(newRoom);
      toast({ title: "Đã tạo phòng chat!" });
      setShowCreate(false);
      navigate(`/chat/${room.id}`);
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    }
  }

  async function handleJoin(roomId: string) {
    try {
      await joinRoom.mutateAsync(roomId);
      navigate(`/chat/${roomId}`);
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Universe Chat
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {dashboard?.roomCount ?? rooms.length} phòng •{" "}
                  <span className="text-rose-400">{dashboard?.totalUnread ?? 0} chưa đọc</span>
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Tạo phòng
              </button>
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm phòng chat..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/30"
                />
              </div>
            </div>

            {/* Type filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {TYPE_FILTER_TABS.map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setFilter(tab.type)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    filter === tab.type
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground border border-white/5 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Room list */}
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Chưa có phòng chat nào</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-3 text-primary text-xs hover:underline"
                >
                  Tạo phòng đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filtered.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onClick={() => navigate(`/chat/${room.id}`)}
                    onJoin={() => handleJoin(room.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create room modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Tạo phòng chat mới</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Loại phòng</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["GLOBAL", "PRIVATE", "PARTY"] as ChatRoomType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewRoom((n) => ({ ...n, type: t }))}
                      className={cn(
                        "p-2 rounded-lg border text-xs font-medium transition-all text-center",
                        newRoom.type === t
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "border-white/10 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {getRoomTypeIcon(t)} {getRoomTypeLabel(t)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tên phòng *</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom((n) => ({ ...n, name: e.target.value }))}
                  placeholder="Ví dụ: General Chat"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Mô tả (tuỳ chọn)</label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom((n) => ({ ...n, description: e.target.value }))}
                  placeholder="Mô tả phòng chat..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRoom.isPublic}
                  onChange={(e) => setNewRoom((n) => ({ ...n, isPublic: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-muted-foreground">Phòng công khai</span>
              </label>
              <button
                onClick={handleCreateRoom}
                disabled={createRoom.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
              >
                {createRoom.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, onClick, onJoin }: { room: ChatRoom; onClick: () => void; onJoin: () => void }) {
  const hasUnread = (room.unreadCount ?? 0) > 0;
  return (
    <div
      onClick={onClick}
      className="glass-panel rounded-xl border border-white/5 hover:border-primary/20 p-4 cursor-pointer transition-all group flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
        {room.icon ?? getRoomTypeIcon(room.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-semibold truncate", hasUnread ? "text-white" : "text-white/80")}>{room.name}</h3>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground flex-shrink-0">
            {getRoomTypeLabel(room.type)}
          </span>
          {!room.isPublic && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {room.memberCount != null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> {room.memberCount}
            </span>
          )}
          {room.lastMessageAt && (
            <span className="text-xs text-muted-foreground">{formatMessageTime(room.lastMessageAt)}</span>
          )}
        </div>
      </div>
      {hasUnread && (
        <span className="min-w-[22px] h-5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[9px] font-mono font-bold flex items-center justify-center px-1 flex-shrink-0">
          {(room.unreadCount ?? 0) > 99 ? "99+" : room.unreadCount}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </div>
  );
}
