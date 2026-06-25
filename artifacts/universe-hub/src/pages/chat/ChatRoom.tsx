import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Send,
  Pin,
  Users,
  Search,
  MoreHorizontal,
  Loader2,
  SmilePlus,
  Reply,
  Pencil,
  Trash2,
  X,
  CheckCheck,
  Paperclip,
} from "lucide-react";
import {
  useChatRoom,
  useChatMessages,
  useChatPins,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useReactToMessage,
  usePinMessage,
  useChatRealtime,
  useSendTyping,
  groupReactions,
  formatMessageTime,
  getRoomTypeIcon,
  type ChatMessage,
} from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "⚡"];

export default function ChatRoom() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/chat/:id");
  const roomId = params?.id ?? null;
  const { toast } = useToast();
  const { accessToken } = useAuth();

  const [content, setContent]       = useState("");
  const [replyTo, setReplyTo]       = useState<ChatMessage | null>(null);
  const [editMsg, setEditMsg]       = useState<ChatMessage | null>(null);
  const [showPins, setShowPins]     = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: room } = useChatRoom(roomId);
  const { data: messages = [], isLoading, refetch } = useChatMessages(roomId);
  const { data: pins = [] } = useChatPins(roomId);

  const send      = useSendMessage(roomId ?? "");
  const editMsg2  = useEditMessage(roomId ?? "");
  const delMsg    = useDeleteMessage(roomId ?? "");
  const react     = useReactToMessage(roomId ?? "");
  const pin       = usePinMessage(roomId ?? "");
  const { handleKeyPress } = useSendTyping(roomId);

  const userId = accessToken ? (() => { try { return JSON.parse(atob(accessToken.split(".")[1]!))?.sub; } catch { return undefined; } })() : undefined;

  useChatRealtime(userId, roomId ?? undefined, (event) => {
    if (event.type === "CHAT_USER_TYPING") {
      const name = (event.data["senderName"] as string) ?? "...";
      if (event.data["userId"] !== userId) {
        setTypingUsers((prev) => prev.includes(name) ? prev : [...prev, name]);
        setTimeout(() => setTypingUsers((prev) => prev.filter((n) => n !== name)), 4000);
      }
    }
    if (event.type === "CHAT_USER_STOPPED_TYPING") {
      const name = (event.data["senderName"] as string) ?? "";
      setTypingUsers((prev) => prev.filter((n) => n !== name));
    }
    if (["CHAT_MESSAGE_SENT", "CHAT_MESSAGE_UPDATED", "CHAT_MESSAGE_DELETED", "CHAT_REACTION"].includes(event.type)) {
      refetch();
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!content.trim()) return;
    const text = content.trim();
    setContent("");
    setReplyTo(null);
    try {
      if (editMsg) {
        await editMsg2.mutateAsync({ messageId: editMsg.id, content: text });
        setEditMsg(null);
      } else {
        await send.mutateAsync({ content: text, replyToId: replyTo?.id });
      }
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
      setContent(text);
    }
  }

  async function handleDelete(msg: ChatMessage) {
    try {
      await delMsg.mutateAsync(msg.id);
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    }
  }

  async function handleReact(messageId: string, emoji: string) {
    try {
      await react.mutateAsync({ messageId, emoji });
      setReactionTarget(null);
    } catch { /* ignore */ }
  }

  async function handlePin(messageId: string) {
    if (!roomId) return;
    try {
      await pin.mutateAsync(messageId);
      toast({ title: "📌 Đã ghim tin nhắn" });
    } catch (err) {
      toast({ title: String(err), variant: "destructive" });
    }
  }

  function startEdit(msg: ChatMessage) {
    setEditMsg(msg);
    setContent(msg.content);
    setReplyTo(null);
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Room header */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-white/5 glass-panel flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/chat")} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="text-2xl">{room ? getRoomTypeIcon(room.type) : "💬"}</div>
              <div>
                <h2 className="font-bold text-white text-sm leading-none">{room?.name ?? "..."}</h2>
                {room?.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{room.description}</p>}
              </div>
              {room?.memberCount != null && (
                <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {room.memberCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {pins.length > 0 && (
                <button
                  onClick={() => setShowPins(!showPins)}
                  className={cn("p-2 rounded-lg transition-colors relative", showPins ? "bg-primary/10 text-primary" : "hover:bg-white/10 text-muted-foreground hover:text-white")}
                >
                  <Pin className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                    {pins.length}
                  </span>
                </button>
              )}
              <button
                onClick={() => setShowMembers(!showMembers)}
                className={cn("p-2 rounded-lg transition-colors", showMembers ? "bg-primary/10 text-primary" : "hover:bg-white/10 text-muted-foreground hover:text-white")}
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Messages area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Pinned messages panel */}
              {showPins && pins.length > 0 && (
                <div className="flex-shrink-0 border-b border-yellow-400/20 bg-yellow-400/5 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Pin className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400">Tin nhắn đã ghim ({pins.length})</span>
                  </div>
                  <div className="space-y-1">
                    {pins.map((p) => (
                      <div key={p.id} className="text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2 line-clamp-1">
                        {p.messageId}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <span className="text-4xl mb-3">💬</span>
                    <p className="text-sm">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe     = msg.senderId === userId;
                    const prevMsg  = messages[idx - 1];
                    const sameUser = prevMsg?.senderId === msg.senderId;
                    const isDeleted = !!msg.deletedAt;
                    return (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMe={isMe}
                        sameUser={sameUser}
                        isDeleted={isDeleted}
                        reactionTarget={reactionTarget}
                        onReactionTarget={setReactionTarget}
                        onReact={handleReact}
                        onReply={() => { setReplyTo(msg); setEditMsg(null); }}
                        onEdit={() => startEdit(msg)}
                        onDelete={() => handleDelete(msg)}
                        onPin={() => handlePin(msg.id)}
                      />
                    );
                  })
                )}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <span className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                    {typingUsers.join(", ")} đang nhập...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply / Edit bar */}
              {(replyTo || editMsg) && (
                <div className="flex-shrink-0 px-4 py-2 border-t border-white/5 bg-white/3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary font-medium">
                      {editMsg ? "✏️ Chỉnh sửa" : `↩ Trả lời ${replyTo?.senderName}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{(editMsg ?? replyTo)?.content}</p>
                  </div>
                  <button onClick={() => { setReplyTo(null); setEditMsg(null); setContent(""); }} className="p-1 rounded hover:bg-white/10 text-muted-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="flex-shrink-0 px-4 py-3 border-t border-white/5">
                <div className="flex items-end gap-2">
                  <div className="flex-1 flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-primary/30 transition-colors">
                    <textarea
                      value={content}
                      onChange={(e) => { setContent(e.target.value); handleKeyPress(); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Nhập tin nhắn..."
                      rows={1}
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none resize-none max-h-32"
                      style={{ height: "24px" }}
                      onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "24px";
                        t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!content.trim() || send.isPending}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-all"
                  >
                    {send.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg, isMe, sameUser, isDeleted, reactionTarget,
  onReactionTarget, onReact, onReply, onEdit, onDelete, onPin,
}: {
  msg: ChatMessage;
  isMe: boolean;
  sameUser: boolean;
  isDeleted: boolean;
  reactionTarget: string | null;
  onReactionTarget: (id: string | null) => void;
  onReact: (id: string, emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const grouped = groupReactions(msg.reactions);

  return (
    <div className={cn("group relative flex flex-col gap-0.5", sameUser ? "mt-0.5" : "mt-3", isMe ? "items-end" : "items-start")}>
      {!sameUser && !isMe && (
        <span className="text-[10px] text-muted-foreground/60 ml-1">{msg.senderName}</span>
      )}
      <div className={cn("relative max-w-[70%] flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm break-words",
            isDeleted ? "text-muted-foreground/50 italic bg-white/3 border border-white/5" :
            isMe ? "bg-primary/20 text-white border border-primary/20" : "bg-white/8 text-white/90 border border-white/5",
            sameUser && isMe ? "rounded-tr-sm" : "",
            sameUser && !isMe ? "rounded-tl-sm" : "",
          )}
        >
          {msg.replyToId && (
            <div className="mb-1 px-2 py-1 rounded border-l-2 border-primary/50 bg-white/5 text-xs text-muted-foreground">
              ↩ Trả lời
            </div>
          )}
          <span>{isDeleted ? "[Tin nhắn đã bị xoá]" : msg.content}</span>
          {msg.editedAt && !isDeleted && (
            <span className="text-[9px] text-muted-foreground/50 ml-1">(đã sửa)</span>
          )}
        </div>

        {/* Action toolbar */}
        {!isDeleted && (
          <div className={cn(
            "hidden group-hover:flex items-center gap-0.5 bg-background/80 backdrop-blur rounded-lg border border-white/10 p-0.5 flex-shrink-0",
            isMe ? "flex-row-reverse" : "flex-row"
          )}>
            <ToolBtn icon={SmilePlus} onClick={() => onReactionTarget(reactionTarget === msg.id ? null : msg.id)} title="Reaction" />
            <ToolBtn icon={Reply} onClick={onReply} title="Trả lời" />
            <ToolBtn icon={Pin} onClick={onPin} title="Ghim" />
            {isMe && <ToolBtn icon={Pencil} onClick={onEdit} title="Sửa" />}
            {isMe && <ToolBtn icon={Trash2} onClick={onDelete} title="Xoá" className="hover:text-red-400" />}
          </div>
        )}
      </div>

      {/* Reactions */}
      {grouped.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5 px-1">
          {grouped.map((r) => (
            <button
              key={r.emoji}
              onClick={() => onReact(msg.id, r.emoji)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
            >
              {r.emoji} <span className="text-muted-foreground">{r.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {reactionTarget === msg.id && (
        <div className={cn("flex items-center gap-1 bg-background/90 backdrop-blur rounded-xl border border-white/10 p-1.5 shadow-xl z-10", isMe ? "flex-row-reverse" : "flex-row")}>
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(msg.id, emoji)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-base transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <span className={cn("text-[9px] text-muted-foreground/40 px-1", isMe ? "text-right" : "text-left")}>
        {formatMessageTime(msg.createdAt)}
        {msg.isPinned && <span className="ml-1 text-yellow-400/60">📌</span>}
      </span>
    </div>
  );
}

function ToolBtn({ icon: Icon, onClick, title, className }: { icon: typeof Send; onClick: () => void; title: string; className?: string }) {
  return (
    <button onClick={onClick} title={title} className={cn("p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors", className)}>
      <Icon className="w-3 h-3" />
    </button>
  );
}
