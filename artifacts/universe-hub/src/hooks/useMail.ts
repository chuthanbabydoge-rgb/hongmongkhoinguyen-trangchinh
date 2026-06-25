import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export interface MailAttachment {
  id:        string;
  mailId:    string;
  type:      string;
  label:     string;
  amount?:   number;
  itemId?:   string;
  itemData?: Record<string, unknown>;
  claimed:   boolean;
  claimedAt?: string;
}

export interface Mail {
  id:          string;
  userId:      string;
  senderId?:   string;
  senderName:  string;
  type:        "SYSTEM" | "QUEST" | "MARKETPLACE" | "WALLET" | "SOCIAL" | "GUILD" | "EVENT" | "COMPENSATION" | "GIFT" | "ADMIN";
  status:      "UNREAD" | "READ" | "CLAIMED" | "ARCHIVED" | "DELETED";
  subject:     string;
  body:        string;
  expiresAt?:  string;
  readAt?:     string;
  claimedAt?:  string;
  archivedAt?: string;
  metadata?:   Record<string, unknown>;
  attachments: MailAttachment[];
  createdAt:   string;
  updatedAt:   string;
}

export interface MailLabel {
  id:        string;
  userId:    string;
  name:      string;
  color:     string;
  createdAt: string;
}

export interface MailDashboard {
  unreadCount:    number;
  claimableCount: number;
  recentMails:    Mail[];
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function useMailDashboard() {
  const { accessToken } = useAuth();
  return useQuery<MailDashboard>({
    queryKey: ["mail", "dashboard"],
    enabled:  !!accessToken,
    queryFn:  async () => {
      const res = await fetch("/api/mail/dashboard", { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch mail dashboard");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30_000,
  });
}

export function useMail(filter?: Record<string, string>) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams(filter);
  return useQuery<Mail[]>({
    queryKey: ["mail", "list", filter],
    enabled:  !!accessToken,
    queryFn:  async () => {
      const res = await fetch(`/api/mail?${params}`, { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch mail");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useUnreadMail() {
  const { accessToken } = useAuth();
  return useQuery<{ data: Mail[]; count: number }>({
    queryKey: ["mail", "unread"],
    enabled:  !!accessToken,
    queryFn:  async () => {
      const res = await fetch("/api/mail/unread", { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch unread mail");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

export function useMailDetail(id: string | null) {
  const { accessToken } = useAuth();
  return useQuery<Mail>({
    queryKey: ["mail", "detail", id],
    enabled:  !!accessToken && !!id,
    queryFn:  async () => {
      const res = await fetch(`/api/mail/${id}`, { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch mail");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useMailLabels() {
  const { accessToken } = useAuth();
  return useQuery<MailLabel[]>({
    queryKey: ["mail", "labels"],
    enabled:  !!accessToken,
    queryFn:  async () => {
      const res = await fetch("/api/mail/labels", { headers: authHeaders(accessToken!) });
      if (!res.ok) throw new Error("Failed to fetch labels");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useMarkRead() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mail/${id}/read`, {
        method:  "PATCH",
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) throw new Error("Failed to mark read");
      return (await res.json()).data as Mail;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mail"] });
    },
  });
}

export function useMarkAllRead() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/mail/read-all", {
        method:  "PATCH",
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) throw new Error("Failed to mark all read");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mail"] });
    },
  });
}

export function useClaimAttachments() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mail/${id}/claim`, {
        method:  "POST",
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to claim");
      }
      return (await res.json()).data as Mail;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mail"] });
    },
  });
}

export function useArchiveMail() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mail/${id}/archive`, {
        method:  "POST",
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) throw new Error("Failed to archive");
      return (await res.json()).data as Mail;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mail"] });
    },
  });
}

export function useDeleteMail() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mail/${id}`, {
        method:  "DELETE",
        headers: authHeaders(accessToken!),
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mail"] });
    },
  });
}

export function useCreateLabel() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const res = await fetch("/api/mail/labels", {
        method:  "POST",
        headers: { ...authHeaders(accessToken!), "Content-Type": "application/json" },
        body:    JSON.stringify({ name, color }),
      });
      if (!res.ok) throw new Error("Failed to create label");
      return (await res.json()).data as MailLabel;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mail", "labels"] });
    },
  });
}

export function getTypeColor(type: Mail["type"]) {
  const map: Record<Mail["type"], string> = {
    SYSTEM:       "border-blue-400/30 bg-blue-400/10 text-blue-400",
    QUEST:        "border-purple-400/30 bg-purple-400/10 text-purple-400",
    MARKETPLACE:  "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    WALLET:       "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
    SOCIAL:       "border-pink-400/30 bg-pink-400/10 text-pink-400",
    GUILD:        "border-orange-400/30 bg-orange-400/10 text-orange-400",
    EVENT:        "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
    COMPENSATION: "border-red-400/30 bg-red-400/10 text-red-400",
    GIFT:         "border-rose-400/30 bg-rose-400/10 text-rose-400",
    ADMIN:        "border-indigo-400/30 bg-indigo-400/10 text-indigo-400",
  };
  return map[type] ?? "border-white/10 bg-white/5 text-muted-foreground";
}

export function getAttachmentIcon(type: string) {
  const map: Record<string, string> = {
    CREDITS:          "💳",
    COINS:            "🪙",
    TOKENS:           "🔮",
    REWARD_POINTS:    "⭐",
    INVENTORY_ITEM:   "📦",
    PET:              "🐾",
    TICKET:           "🎫",
    NFT:              "🖼️",
    WORLD_ASSET:      "🌍",
    GUILD_REWARD:     "🛡️",
    QUEST_REWARD:     "⚔️",
    ACHIEVEMENT_REWARD: "🏆",
  };
  return map[type] ?? "🎁";
}
