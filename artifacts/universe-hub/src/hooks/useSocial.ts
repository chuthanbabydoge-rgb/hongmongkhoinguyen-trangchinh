import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────

export type RelationshipType    = "FRIEND" | "FOLLOWING" | "BLOCKED";
export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
export type PresenceStatus      = "ONLINE" | "AWAY" | "OFFLINE";

export interface SocialRelationship {
  userId:    string;
  targetId:  string;
  type:      RelationshipType;
  createdAt: string;
}

export interface FriendRequest {
  id:         string;
  fromUserId: string;
  toUserId:   string;
  status:     FriendRequestStatus;
  createdAt:  string;
  updatedAt:  string;
}

export interface PublicProfile {
  userId:       string;
  displayName:  string;
  avatarUrl:    string | null;
  friends:      number;
  followers:    number;
  following:    number;
  onlineFriends: number;
  presence:     PresenceStatus;
}

export interface SocialCounts {
  friends:      number;
  followers:    number;
  following:    number;
  onlineFriends: number;
}

export interface UserPresence {
  userId:     string;
  status:     PresenceStatus;
  lastSeenAt: string | null;
  updatedAt:  string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, token: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
      ...(opts?.headers ?? {}),
    },
  });
  const json = await res.json() as { ok: boolean; data: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? `API error ${res.status}`);
  return json.data;
}

// ── Friend requests ───────────────────────────────────────────────────────────

export function useMyFriends() {
  const { accessToken } = useAuth();
  return useQuery<SocialRelationship[]>({
    queryKey: ["social", "friends"],
    queryFn:  () => apiFetch("/api/social/friends", accessToken!),
    enabled:  !!accessToken,
    staleTime: 30_000,
  });
}

export function usePendingRequests() {
  const { accessToken } = useAuth();
  return useQuery<FriendRequest[]>({
    queryKey: ["social", "friends", "pending"],
    queryFn:  () => apiFetch("/api/social/friends/pending", accessToken!),
    enabled:  !!accessToken,
    staleTime: 15_000,
  });
}

export function useSentRequests() {
  const { accessToken } = useAuth();
  return useQuery<FriendRequest[]>({
    queryKey: ["social", "friends", "sent"],
    queryFn:  () => apiFetch("/api/social/friends/sent", accessToken!),
    enabled:  !!accessToken,
    staleTime: 15_000,
  });
}

export function useSendFriendRequest() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toUserId: string) =>
      apiFetch<FriendRequest>("/api/social/friends/request", accessToken!, {
        method: "POST",
        body:   JSON.stringify({ toUserId }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<FriendRequest>(`/api/social/friends/${id}/accept`, accessToken!, { method: "POST" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

export function useDeclineFriendRequest() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<FriendRequest>(`/api/social/friends/${id}/decline`, accessToken!, { method: "POST" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

// ── Follow system ─────────────────────────────────────────────────────────────

export function useFollowers() {
  const { accessToken } = useAuth();
  return useQuery<SocialRelationship[]>({
    queryKey: ["social", "followers"],
    queryFn:  () => apiFetch("/api/social/followers", accessToken!),
    enabled:  !!accessToken,
    staleTime: 30_000,
  });
}

export function useFollowing() {
  const { accessToken } = useAuth();
  return useQuery<SocialRelationship[]>({
    queryKey: ["social", "following"],
    queryFn:  () => apiFetch("/api/social/following", accessToken!),
    enabled:  !!accessToken,
    staleTime: 30_000,
  });
}

export function useFollowUser() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<SocialRelationship>(`/api/social/follow/${userId}`, accessToken!, { method: "POST" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

export function useUnfollowUser() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<{ unfollowed: boolean }>(`/api/social/follow/${userId}`, accessToken!, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { accessToken } = useAuth();
  return useQuery<PublicProfile>({
    queryKey: ["social", "profile", "me"],
    queryFn:  () => apiFetch("/api/social/profile/me", accessToken!),
    enabled:  !!accessToken,
    staleTime: 30_000,
  });
}

export function useSocialProfile(userId: string | undefined) {
  const { accessToken } = useAuth();
  return useQuery<PublicProfile>({
    queryKey: ["social", "profile", userId],
    queryFn:  () => apiFetch(`/api/social/profile/${userId}`, accessToken ?? ""),
    enabled:  !!userId,
    staleTime: 30_000,
  });
}

export function useSocialSearch(query: string) {
  const { accessToken } = useAuth();
  return useQuery<PublicProfile[]>({
    queryKey: ["social", "search", query],
    queryFn:  () => apiFetch(`/api/social/search?q=${encodeURIComponent(query)}`, accessToken ?? ""),
    enabled:  query.length >= 2,
    staleTime: 10_000,
  });
}

// ── Social counts ─────────────────────────────────────────────────────────────

export function useSocialCounts() {
  const { accessToken } = useAuth();
  return useQuery<SocialCounts>({
    queryKey: ["social", "counts"],
    queryFn:  () => apiFetch("/api/social/counts", accessToken!),
    enabled:  !!accessToken,
    staleTime: 30_000,
  });
}

// ── Presence ──────────────────────────────────────────────────────────────────

export function usePresence(userId: string | undefined) {
  const { accessToken } = useAuth();
  return useQuery<UserPresence>({
    queryKey: ["social", "presence", userId],
    queryFn:  () => apiFetch(`/api/social/presence/${userId}`, accessToken ?? ""),
    enabled:  !!userId && !!accessToken,
    staleTime: 15_000,
  });
}

export function useSetPresence() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: PresenceStatus) =>
      apiFetch<UserPresence>("/api/social/presence", accessToken!, {
        method: "POST",
        body:   JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social", "presence"] });
      void qc.invalidateQueries({ queryKey: ["social", "counts"] });
    },
  });
}
