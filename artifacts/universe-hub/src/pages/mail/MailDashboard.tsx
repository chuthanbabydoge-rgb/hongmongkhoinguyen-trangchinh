import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useState } from "react";
import { Link } from "wouter";
import {
  Mail,
  MailOpen,
  Gift,
  Archive,
  Trash2,
  CheckCheck,
  RefreshCw,
  Inbox,
  Tag,
  Filter,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import {
  useMail,
  useUnreadMail,
  useMailLabels,
  useMarkAllRead,
  useArchiveMail,
  useDeleteMail,
  useClaimAttachments,
  getTypeColor,
  getAttachmentIcon,
  type Mail as MailType,
} from "@/hooks/useMail";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import MailDetailPanel from "./MailDetail";

type SidebarTab = "inbox" | "unread" | "archived" | "claimable";

export default function MailDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SidebarTab>("inbox");
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filterMap: Record<SidebarTab, Record<string, string>> = {
    inbox:     {},
    unread:    { status: "UNREAD" },
    archived:  { status: "ARCHIVED" },
    claimable: { hasAttachment: "true" },
  };

  const { data: mails = [], isLoading, refetch } = useMail({
    ...filterMap[activeTab],
    ...(search ? { search } : {}),
  });
  const { data: unreadData } = useUnreadMail();
  const { data: labels = [] } = useMailLabels();
  const markAllRead = useMarkAllRead();
  const archive = useArchiveMail();
  const deleteMail = useDeleteMail();
  const claim = useClaimAttachments();

  const unreadCount = unreadData?.count ?? 0;

  const claimableMails = mails.filter(
    (m) => m.attachments.some((a) => !a.claimed) && m.status !== "DELETED",
  );

  const displayedMails = activeTab === "claimable" ? claimableMails : mails;

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
      toast({ title: "Đã đánh dấu tất cả là đã đọc" });
    } catch {
      toast({ title: "Lỗi", description: "Không thể đánh dấu đã đọc", variant: "destructive" });
    }
  }

  async function handleArchive(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await archive.mutateAsync(id);
      toast({ title: "Đã lưu trữ thư" });
      if (selectedMailId === id) setSelectedMailId(null);
    } catch {
      toast({ title: "Lỗi", variant: "destructive" });
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await deleteMail.mutateAsync(id);
      toast({ title: "Đã xoá thư" });
      if (selectedMailId === id) setSelectedMailId(null);
    } catch {
      toast({ title: "Lỗi", variant: "destructive" });
    }
  }

  async function handleClaim(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await claim.mutateAsync(id);
      toast({ title: "🎁 Nhận thưởng thành công!" });
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    }
  }

  const tabs = [
    { id: "inbox" as const,    icon: Inbox,    label: "Hộp thư đến",  badge: unreadCount },
    { id: "unread" as const,   icon: MailOpen, label: "Chưa đọc",     badge: unreadCount },
    { id: "archived" as const, icon: Archive,  label: "Đã lưu trữ",   badge: 0 },
    { id: "claimable" as const, icon: Gift,    label: "Phần thưởng",  badge: claimableMails.length },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          {/* Mail sidebar */}
          <div className="w-64 flex-shrink-0 border-r border-white/5 glass-panel flex flex-col">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-white">Universe Mail</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/30"
                />
              </div>
            </div>

            <nav className="p-2 space-y-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left font-medium">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="min-w-[18px] h-4 rounded-full bg-rose-400/20 border border-rose-400/30 text-rose-400 text-[9px] font-mono font-bold flex items-center justify-center px-1">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {labels.length > 0 && (
              <>
                <div className="px-4 py-2 border-t border-white/5">
                  <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Nhãn</p>
                </div>
                <div className="px-2 space-y-0.5">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-all"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: label.color }} />
                      <span className="flex-1 text-left truncate">{label.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mt-auto p-3 border-t border-white/5 space-y-2">
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending || unreadCount === 0}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-white/5 hover:text-white transition-all disabled:opacity-40"
              >
                {markAllRead.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Đọc tất cả
              </button>
              <button
                onClick={() => refetch()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-white/5 hover:text-white transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm mới
              </button>
            </div>
          </div>

          {/* Mail list */}
          <div className="flex-1 flex overflow-hidden">
            <div className={cn(
              "border-r border-white/5 flex flex-col overflow-hidden transition-all",
              selectedMailId ? "w-80 flex-shrink-0" : "flex-1"
            )}>
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">
                  {tabs.find((t) => t.id === activeTab)?.label}
                  <span className="ml-2 text-xs text-muted-foreground font-normal">({displayedMails.length})</span>
                </h3>
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : displayedMails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <Mail className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm">Không có thư nào</p>
                  </div>
                ) : (
                  displayedMails.map((mail) => (
                    <MailRow
                      key={mail.id}
                      mail={mail}
                      selected={selectedMailId === mail.id}
                      compact={!!selectedMailId}
                      onSelect={() => setSelectedMailId(mail.id === selectedMailId ? null : mail.id)}
                      onArchive={(e) => handleArchive(mail.id, e)}
                      onDelete={(e) => handleDelete(mail.id, e)}
                      onClaim={(e) => handleClaim(mail.id, e)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Detail panel */}
            {selectedMailId && (
              <div className="flex-1 overflow-y-auto">
                <MailDetailPanel
                  mailId={selectedMailId}
                  onClose={() => setSelectedMailId(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MailRow({
  mail,
  selected,
  compact,
  onSelect,
  onArchive,
  onDelete,
  onClaim,
}: {
  mail: MailType;
  selected: boolean;
  compact: boolean;
  onSelect: () => void;
  onArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onClaim: (e: React.MouseEvent) => void;
}) {
  const isUnread = mail.status === "UNREAD";
  const hasUnclaimed = mail.attachments.some((a) => !a.claimed);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative px-4 py-3 border-b border-white/5 cursor-pointer transition-all group",
        selected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-white/3",
        isUnread && !selected && "bg-white/[0.02]"
      )}
    >
      <div className="flex items-start gap-2 min-w-0">
        {isUnread && (
          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={cn("text-xs font-semibold truncate", isUnread ? "text-white" : "text-muted-foreground")}>
              {mail.senderName}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/60 flex-shrink-0">
              {new Date(mail.createdAt).toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}
            </span>
          </div>
          <p className={cn("text-xs truncate mb-1", isUnread ? "text-white/90 font-medium" : "text-muted-foreground")}>
            {mail.subject}
          </p>
          {!compact && (
            <p className="text-[10px] text-muted-foreground/60 truncate">
              {mail.body.slice(0, 80)}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded border", getTypeColor(mail.type))}>
              {mail.type}
            </span>
            {hasUnclaimed && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
                🎁 Phần thưởng
              </span>
            )}
            {mail.attachments.length > 0 && mail.attachments.every((a) => a.claimed) && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground/50">
                ✓ Đã nhận
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (show on hover) */}
      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1">
        {hasUnclaimed && (
          <button onClick={onClaim} className="p-1 rounded hover:bg-yellow-400/10 text-yellow-400 transition-colors" title="Nhận thưởng">
            <Gift className="w-3 h-3" />
          </button>
        )}
        <button onClick={onArchive} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors" title="Lưu trữ">
          <Archive className="w-3 h-3" />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-400/10 text-red-400 transition-colors" title="Xoá">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
