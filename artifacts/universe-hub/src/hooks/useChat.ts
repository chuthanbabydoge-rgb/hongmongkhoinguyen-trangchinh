import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useCallback } from "react";

// ─── Domain types ─────────────────────────────────────────────────────────────

export type ChatRoomType = "GLOBAL" | "PRIVATE" | "GUILD" | "PARTY" | "MARKETPLACE" | "SYSTEM" | "SUPPORT";
export type ChatMemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type ChatMessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "ITEM_SHARE" | "QUEST_SHARE" | "ACHIEVEMENT" | "LOCATION";

export interface ChatReaction {
  id:        string;
  messageId: string;
  userId:    string;
  emoji:     string;
  createdAt: string;
}

export interface ChatAttachment {
  id:        string;
  messageId: string;
  type:      string;
  url:       string;
  filename?: string;
  size?:     number;
  mimeType?: string;
  createdAt: string;
}

export interface ChatMessage {
  id:          string;
  roomId:      string;
  senderId:    string;
  senderName:  string;
  type:        ChatMessageType;
  content:     string;
  replyToId?:  string;
  editedAt?:   string;
  deletedAt?:  string;
  isPinned:    boolean;
  reactions:   ChatReaction[];
  attachments: ChatAttachment[];
  readCount?:  number;
  createdAt:   string;
  updatedAt:   string;
}

export interface ChatMember {
  id:                   string;
  roomId:               string;
  userId:               string;
  role:                 ChatMemberRole;
  joinedAt:             string;
  lastReadAt?:          string;
  notificationsEnabled: boolean;
  unreadCount:          number;
}

export interface ChatRoom {
  id:            string;
  type:          ChatRoomType;
  name:          string;
  slug?:         string;
  description?:  string;
  icon?:         string;
  ownerId?:      string;
  isPublic:      boolean;
  isArchived:    boolean;
  lastMessageAt?: string;
  memberCount?:  number;
  unreadCount?:  number;
  createdAt:     string;
  updatedAt:     string;
}

export interface ChatPin {
  id:        string;
  roomId:    string;
  messageId: string;
  pinnedBy:  string;
  note?:     string;
  createdAt: string;
}

export interface ChatDashboard {
  totalUnread: number;
  roomCount:   number;
  recentRooms: ChatRoom[];
}

export interface ChatSettings {
  notificationsEnabled: boolean;
  soundEnabled:         boolean;
  showOnlineStatus:     boolean;
  theme:                string;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useChatDashboard() {
  const { accessToken } = useAuth();
  return useQuery<ChatDashboard>({
    queryKey:       ["chat", "dashboard"],
    enabled:        !!accessToken,
    refetchInterval: 30_000,
    queryFn: async () => {
      const res = await fetch("/api/chat/dashboard", { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch chat dashboard");
      return (await res.json()).data;
    },
  });
}

export function useMyRooms() {
  const { accessToken } = useAuth();
  return useQuery<ChatRoom[]>({
    queryKey:       ["chat", "rooms"],
    enabled:        !!accessToken,
    refetchInterval: 15_000,
    queryFn: async () => {
      const res = await fetch("/api/chat/rooms", { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return (await res.json()).data;
    },
  });
}

export function useChatRoom(id: string | null) {
  const { accessToken } = useAuth();
  return useQuery<ChatRoom>({
    queryKey: ["chat", "room", id],
    enabled:  !!accessToken && !!id,
    queryFn:  async () => {
      const res = await fetch(`/api/chat/rooms/${id}`, { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch room");
      return (await res.json()).data;
    },
  });
}

export function useChatMessages(roomId: string | null, limit = 50) {
  const { accessToken } = useAuth();
  return useQuery<ChatMessage[]>({
    queryKey: ["chat", "messages", roomId],
    enabled:  !!accessToken && !!roomId,
    queryFn:  async () => {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages?limit=${limit}`, {
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return (await res.json()).data;
    },
    staleTime: 0,
  });
}

export function useChatMembers(roomId: string | null) {
  const { accessToken } = useAuth();
  return useQuery<ChatMember[]>({
    queryKey: ["chat", "members", roomId],
    enabled:  !!accessToken && !!roomId,
    queryFn:  async () => {
      const res = await fetch(`/api/chat/rooms/${roomId}/members`, { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch members");
      return (await res.json()).data;
    },
  });
}

export function useChatPins(roomId: string | null) {
  const { accessToken } = useAuth();
  return useQuery<ChatPin[]>({
    queryKey: ["chat", "pins", roomId],
    enabled:  !!accessToken && !!roomId,
    queryFn:  async () => {
      const res = await fetch(`/api/chat/rooms/${roomId}/pins`, { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch pins");
      return (await res.json()).data;
    },
  });
}

export function useChatSettings() {
  const { accessToken } = useAuth();
  return useQuery<ChatSettings>({
    queryKey: ["chat", "settings"],
    enabled:  !!accessToken,
    queryFn:  async () => {
      const res = await fetch("/api/chat/settings", { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return (await res.json()).data;
    },
  });
}

export function useCreateRoom() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { type: ChatRoomType; name: string; description?: string; isPublic?: boolean; memberIds?: string[] }) => {
      const res = await fetch("/api/chat/rooms", {
        method:  "POST",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create room");
      return (await res.json()).data as ChatRoom;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "rooms"] }),
  });
}

export function useGetOrCreatePrivate() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetUserId, targetUserName }: { targetUserId: string; targetUserName?: string }) => {
      const res = await fetch("/api/chat/rooms/private", {
        method:  "POST",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify({ targetUserId, targetUserName }),
      });
      if (!res.ok) throw new Error("Failed to get or create private room");
      return (await res.json()).data as ChatRoom;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "rooms"] }),
  });
}

export function useSendMessage(roomId: string) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { content: string; type?: ChatMessageType; replyToId?: string }) => {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method:  "POST",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return (await res.json()).data as ChatMessage;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "messages", roomId] }),
  });
}

export function useEditMessage(roomId: string) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const res = await fetch(`/api/chat/messages/${messageId}/edit`, {
        method:  "PATCH",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to edit message");
      return (await res.json()).data as ChatMessage;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "messages", roomId] }),
  });
}

export function useDeleteMessage(roomId: string) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method:  "DELETE",
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "messages", roomId] }),
  });
}

export function useReactToMessage(roomId: string) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await fetch(`/api/chat/messages/${messageId}/react`, {
        method:  "POST",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error("Failed to react");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "messages", roomId] }),
  });
}

export function usePinMessage(roomId: string) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/chat/messages/${messageId}/pin`, {
        method:  "POST",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify({ roomId }),
      });
      if (!res.ok) throw new Error("Failed to pin");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "pins", roomId] });
      qc.invalidateQueries({ queryKey: ["chat", "messages", roomId] });
    },
  });
}

export function useJoinRoom() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await fetch(`/api/chat/rooms/${roomId}/join`, {
        method:  "POST",
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) throw new Error("Failed to join room");
      return (await res.json()).data as ChatMember;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat"] }),
  });
}

export function useUpdateChatSettings() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<ChatSettings>) => {
      const res = await fetch("/api/chat/settings", {
        method:  "PATCH",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return (await res.json()).data as ChatSettings;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "settings"] }),
  });
}

// ─── WebSocket hook for realtime ──────────────────────────────────────────────

export function useChatRealtime(
  userId: string | undefined,
  roomId: string | undefined,
  onEvent: (event: { type: string; data: Record<string, unknown>; roomId?: string }) => void,
) {
  const qc = useQueryClient();
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!userId) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/marketplace`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "subscribe", userId }));
    };

    ws.onmessage = (raw) => {
      try {
        const event = JSON.parse(raw.data) as { type: string; roomId?: string; data: Record<string, unknown> };
        if (!event.type?.startsWith("CHAT_")) return;
        onEventRef.current(event);
        // Invalidate messages for the room that received the event
        if (event.roomId) {
          qc.invalidateQueries({ queryKey: ["chat", "messages", event.roomId] });
          qc.invalidateQueries({ queryKey: ["chat", "rooms"] });
          qc.invalidateQueries({ queryKey: ["chat", "dashboard"] });
        }
      } catch {
        // ignore
      }
    };

    return () => ws.close();
  }, [userId, qc]);
}

// ─── Typing indicator helpers ──────────────────────────────────────────────────

export function useSendTyping(roomId: string | null) {
  const { accessToken } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!accessToken || !roomId) return;
      fetch(`/api/chat/rooms/${roomId}/typing`, {
        method:  "POST",
        headers: { ...authHeaders(accessToken), "Content-Type": "application/json" },
        body:    JSON.stringify({ isTyping }),
      }).catch(() => {});
    },
    [accessToken, roomId],
  );

  const handleKeyPress = useCallback(() => {
    sendTyping(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => sendTyping(false), 3000);
  }, [sendTyping]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { handleKeyPress };
}

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getRoomTypeIcon(type: ChatRoomType): string {
  const map: Record<ChatRoomType, string> = {
    GLOBAL:      "🌍",
    PRIVATE:     "🔒",
    GUILD:       "🛡️",
    PARTY:       "⚔️",
    MARKETPLACE: "🏪",
    SYSTEM:      "⚙️",
    SUPPORT:     "🎧",
  };
  return map[type] ?? "💬";
}

export function getRoomTypeLabel(type: ChatRoomType): string {
  const map: Record<ChatRoomType, string> = {
    GLOBAL:      "Toàn cầu",
    PRIVATE:     "Riêng tư",
    GUILD:       "Guild",
    PARTY:       "Nhóm",
    MARKETPLACE: "Chợ",
    SYSTEM:      "Hệ thống",
    SUPPORT:     "Hỗ trợ",
  };
  return map[type] ?? type;
}

export function groupReactions(reactions: ChatReaction[]): { emoji: string; count: number; users: string[] }[] {
  const map = new Map<string, { count: number; users: string[] }>();
  for (const r of reactions) {
    const existing = map.get(r.emoji) ?? { count: 0, users: [] };
    existing.count++;
    existing.users.push(r.userId);
    map.set(r.emoji, existing);
  }
  return Array.from(map.entries()).map(([emoji, v]) => ({ emoji, ...v }));
}

export function formatMessageTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Vừa xong";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút`;
  if (diff < 86_400_000) return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
}