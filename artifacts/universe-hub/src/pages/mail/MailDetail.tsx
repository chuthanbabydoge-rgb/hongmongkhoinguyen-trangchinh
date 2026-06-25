import { useEffect } from "react";
import { X, Gift, Archive, Trash2, Loader2, CheckCircle2, Clock } from "lucide-react";
import {
  useMailDetail,
  useMarkRead,
  useClaimAttachments,
  useArchiveMail,
  useDeleteMail,
  getTypeColor,
  getAttachmentIcon,
} from "@/hooks/useMail";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  mailId:   string;
  onClose?: () => void;
}

export default function MailDetailPanel({ mailId, onClose }: Props) {
  const { toast } = useToast();
  const { data: mail, isLoading } = useMailDetail(mailId);
  const markRead = useMarkRead();
  const claim    = useClaimAttachments();
  const archive  = useArchiveMail();
  const deleteMail = useDeleteMail();

  useEffect(() => {
    if (mail && mail.status === "UNREAD") {
      markRead.mutate(mailId);
    }
  }, [mail?.id, mail?.status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!mail) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Không tìm thấy thư
      </div>
    );
  }

  const hasUnclaimed = mail.attachments.some((a) => !a.claimed);

  async function handleClaim() {
    try {
      await claim.mutateAsync(mail!.id);
      toast({ title: "🎁 Đã nhận phần thưởng!" });
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    }
  }

  async function handleArchive() {
    try {
      await archive.mutateAsync(mail!.id);
      toast({ title: "Đã lưu trữ thư" });
      onClose?.();
    } catch {
      toast({ title: "Lỗi khi lưu trữ", variant: "destructive" });
    }
  }

  async function handleDelete() {
    try {
      await deleteMail.mutateAsync(mail!.id);
      toast({ title: "Đã xoá thư" });
      onClose?.();
    } catch {
      toast({ title: "Lỗi khi xoá", variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border", getTypeColor(mail.type))}>
              {mail.type}
            </span>
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded border",
              mail.status === "UNREAD"   ? "border-blue-400/30 bg-blue-400/10 text-blue-400" :
              mail.status === "READ"     ? "border-white/10 text-muted-foreground" :
              mail.status === "CLAIMED"  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" :
              mail.status === "ARCHIVED" ? "border-orange-400/30 bg-orange-400/10 text-orange-400" :
                                           "border-red-400/30 bg-red-400/10 text-red-400"
            )}>
              {mail.status}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">{mail.subject}</h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>Từ: <span className="text-white/70">{mail.senderName}</span></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(mail.createdAt).toLocaleString("vi-VN")}
            </span>
            {mail.expiresAt && (
              <>
                <span>•</span>
                <span className="text-yellow-400">Hết hạn: {new Date(mail.expiresAt).toLocaleDateString("vi-VN")}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {hasUnclaimed && (
            <button
              onClick={handleClaim}
              disabled={claim.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/20 text-sm font-medium transition-all disabled:opacity-50"
            >
              {claim.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              Nhận thưởng
            </button>
          )}
          <button
            onClick={handleArchive}
            disabled={archive.isPending}
            className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            title="Lưu trữ"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMail.isPending}
            className="p-2 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-400 transition-colors"
            title="Xoá"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Attachments */}
      {mail.attachments.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">
              Phần đính kèm ({mail.attachments.length})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mail.attachments.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border text-xs",
                  a.claimed
                    ? "border-white/5 bg-white/3 text-muted-foreground opacity-60"
                    : "border-yellow-400/20 bg-yellow-400/5 text-white"
                )}
              >
                <span className="text-base">{getAttachmentIcon(a.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.label}</p>
                  {a.amount && (
                    <p className="text-muted-foreground">
                      {a.amount.toLocaleString()}
                    </p>
                  )}
                </div>
                {a.claimed && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {!hasUnclaimed && (
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Đã nhận tất cả phần thưởng
              {mail.claimedAt && ` • ${new Date(mail.claimedAt).toLocaleDateString("vi-VN")}`}
            </p>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 prose prose-invert prose-sm max-w-none">
        <div className="glass-panel rounded-xl p-5 border border-white/5">
          <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
            {mail.body}
          </div>
        </div>
      </div>

      {/* Read timestamp */}
      {mail.readAt && (
        <div className="mt-4 text-[10px] text-muted-foreground/40 text-right">
          Đã đọc lúc {new Date(mail.readAt).toLocaleString("vi-VN")}
        </div>
      )}
    </div>
  );
}
