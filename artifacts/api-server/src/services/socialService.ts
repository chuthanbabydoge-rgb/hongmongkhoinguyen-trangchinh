// ─────────────────────────────────────────────────────────────────────────────
// SocialService — HUB-10
//
// Manages the social graph: friends, followers, presence, public profiles.
// Business rules:
//   • Cannot send friend request to self
//   • Cannot duplicate a pending request
//   • Accepting creates a bidirectional FRIEND relationship
//   • Notifications and activity events are fired on key actions
// ─────────────────────────────────────────────────────────────────────────────

import type { ISocialRepository, FriendRequest, SocialRelationship, UserPresence, PublicProfile, PresenceStatus } from "../repositories/socialRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";

export class SocialError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "SocialError";
  }
}

export interface SocialProfile {
  userId:      string;
  displayName: string;
  avatarUrl:   string | null;
  reputation:  { totalPoints: number; level: string } | null;
  achievements: { key: string; title: string; icon: string }[];
  friends:     number;
  followers:   number;
  following:   number;
  onlineFriends: number;
  presence:    PresenceStatus;
  joinDate:    string | null;
}

export class SocialService {
  constructor(
    private readonly repo: ISocialRepository,
    private readonly notifService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  // ── Friend requests ──────────────────────────────────────────────────────────

  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    if (fromUserId === toUserId) {
      throw new SocialError("Không thể tự kết bạn với chính mình.", "SELF_REQUEST");
    }

    const alreadyFriends = await this.repo.hasRelationship(fromUserId, toUserId, "FRIEND");
    if (alreadyFriends) {
      throw new SocialError("Hai người đã là bạn bè rồi.", "ALREADY_FRIENDS");
    }

    const hasPending = await this.repo.hasPendingRequest(fromUserId, toUserId);
    if (hasPending) {
      throw new SocialError("Đã có lời mời kết bạn đang chờ xử lý.", "DUPLICATE_REQUEST");
    }

    const req = await this.repo.createFriendRequest(fromUserId, toUserId);

    this.notifService.fire(
      toUserId,
      "social",
      "Lời mời kết bạn mới",
      `Bạn có một lời mời kết bạn mới đang chờ xử lý.`,
    );

    this.activitiesService.fire({
      userId:      fromUserId,
      type:        "social",
      title:       "Lời mời kết bạn đã gửi",
      description: "Đã gửi lời mời kết bạn.",
      metadata:    { requestId: req.id, toUserId },
      sourceApp:   "universe-social",
    });

    return req;
  }

  async acceptFriendRequest(requestId: string, currentUserId: string): Promise<FriendRequest> {
    const req = await this.repo.getFriendRequestById(requestId);
    if (!req) {
      throw new SocialError("Không tìm thấy lời mời kết bạn.", "NOT_FOUND", 404);
    }
    if (req.toUserId !== currentUserId) {
      throw new SocialError("Không có quyền chấp nhận lời mời này.", "FORBIDDEN", 403);
    }
    if (req.status !== "PENDING") {
      throw new SocialError("Lời mời kết bạn không còn ở trạng thái chờ.", "INVALID_STATUS");
    }

    const updated = await this.repo.updateFriendRequestStatus(requestId, "ACCEPTED");

    await this.repo.createRelationship(req.fromUserId, req.toUserId, "FRIEND");
    await this.repo.createRelationship(req.toUserId, req.fromUserId, "FRIEND");

    this.notifService.fire(
      req.fromUserId,
      "social",
      "Lời mời kết bạn được chấp nhận",
      `Lời mời kết bạn của bạn đã được chấp nhận.`,
    );

    this.activitiesService.fire({
      userId:      currentUserId,
      type:        "social",
      title:       "Kết bạn thành công",
      description: "Đã chấp nhận lời mời kết bạn.",
      metadata:    { requestId, fromUserId: req.fromUserId },
      sourceApp:   "universe-social",
    });

    return updated!;
  }

  async declineFriendRequest(requestId: string, currentUserId: string): Promise<FriendRequest> {
    const req = await this.repo.getFriendRequestById(requestId);
    if (!req) {
      throw new SocialError("Không tìm thấy lời mời kết bạn.", "NOT_FOUND", 404);
    }
    if (req.toUserId !== currentUserId) {
      throw new SocialError("Không có quyền từ chối lời mời này.", "FORBIDDEN", 403);
    }
    if (req.status !== "PENDING") {
      throw new SocialError("Lời mời kết bạn không còn ở trạng thái chờ.", "INVALID_STATUS");
    }

    const updated = await this.repo.updateFriendRequestStatus(requestId, "DECLINED");
    return updated!;
  }

  async cancelFriendRequest(requestId: string, currentUserId: string): Promise<FriendRequest> {
    const req = await this.repo.getFriendRequestById(requestId);
    if (!req) {
      throw new SocialError("Không tìm thấy lời mời kết bạn.", "NOT_FOUND", 404);
    }
    if (req.fromUserId !== currentUserId) {
      throw new SocialError("Không có quyền hủy lời mời này.", "FORBIDDEN", 403);
    }
    if (req.status !== "PENDING") {
      throw new SocialError("Lời mời kết bạn không còn ở trạng thái chờ.", "INVALID_STATUS");
    }

    const updated = await this.repo.updateFriendRequestStatus(requestId, "CANCELLED");
    return updated!;
  }

  async getFriends(userId: string): Promise<SocialRelationship[]> {
    return this.repo.getRelationships(userId, "FRIEND");
  }

  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    return this.repo.getPendingIncomingRequests(userId);
  }

  async getSentRequests(userId: string): Promise<FriendRequest[]> {
    return this.repo.getPendingSentRequests(userId);
  }

  // ── Follow system ────────────────────────────────────────────────────────────

  async followUser(fromUserId: string, toUserId: string): Promise<SocialRelationship> {
    if (fromUserId === toUserId) {
      throw new SocialError("Không thể tự theo dõi chính mình.", "SELF_FOLLOW");
    }

    const alreadyFollowing = await this.repo.hasRelationship(fromUserId, toUserId, "FOLLOWING");
    if (alreadyFollowing) {
      throw new SocialError("Bạn đã theo dõi người này rồi.", "ALREADY_FOLLOWING");
    }

    const rel = await this.repo.createRelationship(fromUserId, toUserId, "FOLLOWING");

    this.notifService.fire(
      toUserId,
      "social",
      "Người theo dõi mới",
      `Bạn có một người theo dõi mới.`,
    );

    this.activitiesService.fire({
      userId:      fromUserId,
      type:        "social",
      title:       "Đã theo dõi người dùng",
      description: "Bắt đầu theo dõi một người dùng.",
      metadata:    { targetId: toUserId },
      sourceApp:   "universe-social",
    });

    return rel;
  }

  async unfollowUser(fromUserId: string, toUserId: string): Promise<boolean> {
    const deleted = await this.repo.deleteRelationship(fromUserId, toUserId, "FOLLOWING");
    if (!deleted) {
      throw new SocialError("Bạn chưa theo dõi người này.", "NOT_FOLLOWING", 404);
    }
    return true;
  }

  async getFollowers(userId: string): Promise<SocialRelationship[]> {
    return this.repo.getIncomingRelationships(userId, "FOLLOWING");
  }

  async getFollowing(userId: string): Promise<SocialRelationship[]> {
    return this.repo.getRelationships(userId, "FOLLOWING");
  }

  // ── Presence ─────────────────────────────────────────────────────────────────

  async setPresence(userId: string, status: PresenceStatus): Promise<UserPresence> {
    return this.repo.setPresence(userId, status);
  }

  async getPresence(userId: string): Promise<UserPresence | null> {
    return this.repo.getPresence(userId);
  }

  // ── Public profiles ──────────────────────────────────────────────────────────

  async syncPublicProfile(userId: string, displayName: string, avatarUrl: string | null): Promise<PublicProfile> {
    return this.repo.setPublicProfile(userId, { displayName, avatarUrl: avatarUrl ?? undefined });
  }

  async getPublicProfile(userId: string): Promise<PublicProfile | null> {
    return this.repo.getPublicProfile(userId);
  }

  async searchUsers(query: string, limit = 20): Promise<PublicProfile[]> {
    if (!query.trim()) return [];
    return this.repo.searchPublicProfiles(query.trim(), limit);
  }

  // ── Social counts ────────────────────────────────────────────────────────────

  async getSocialCounts(userId: string): Promise<{ friends: number; followers: number; following: number; onlineFriends: number }> {
    const [friends, followers, following] = await Promise.all([
      this.repo.countRelationships(userId, "FRIEND"),
      this.repo.countIncomingRelationships(userId, "FOLLOWING"),
      this.repo.countRelationships(userId, "FOLLOWING"),
    ]);

    const friendRels = await this.repo.getRelationships(userId, "FRIEND");
    const friendIds  = friendRels.map(r => r.targetId);
    let onlineFriends = 0;
    if (friendIds.length > 0) {
      const presences = await this.repo.getPresenceForUsers(friendIds);
      onlineFriends = presences.filter(p => p.status === "ONLINE").length;
    }

    return { friends, followers, following, onlineFriends };
  }
}
