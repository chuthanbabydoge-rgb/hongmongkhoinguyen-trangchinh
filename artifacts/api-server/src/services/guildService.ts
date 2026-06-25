// ─────────────────────────────────────────────────────────────────────────────
// GuildService — HUB-11
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IGuildRepository,
  Guild,
  GuildMember,
  GuildJoinRequest,
  GuildInvite,
  GuildAnnouncement,
  GuildLog,
  GuildContribution,
  GuildEvent,
  GuildWarehouseItem,
  GuildTreasuryTransaction,
  GuildRole,
  GuildPermission,
  CreateGuildInput,
  UpdateGuildInput,
} from "../repositories/guildRepository.js";
import { ROLE_RANK, DEFAULT_ROLE_PERMISSIONS } from "../repositories/guildRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { UserReputationService } from "./userReputationService.js";
import { questEventBus } from "../realtime/questEventBus.js";

export class GuildError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "GuildError";
  }
}

function hasPermission(role: GuildRole, permission: GuildPermission): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

function assertPermission(role: GuildRole, permission: GuildPermission): void {
  if (!hasPermission(role, permission)) {
    throw new GuildError(`Vai trò '${role}' không có quyền '${permission}'.`, "FORBIDDEN", 403);
  }
}

function assertHigherRank(actorRole: GuildRole, targetRole: GuildRole): void {
  if (ROLE_RANK[actorRole] <= ROLE_RANK[targetRole]) {
    throw new GuildError("Không thể thực hiện thao tác với thành viên có vai trò cao hơn hoặc bằng bạn.", "FORBIDDEN", 403);
  }
}

export class GuildService {
  constructor(
    private readonly repo: IGuildRepository,
    private readonly notifService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly reputationService: UserReputationService,
  ) {}

  // ── Guild CRUD ───────────────────────────────────────────────────────────────

  async createGuild(input: CreateGuildInput): Promise<Guild> {
    if (!input.name?.trim()) throw new GuildError("Tên guild là bắt buộc.", "VALIDATION");
    if (!input.tag?.trim())  throw new GuildError("Tag guild là bắt buộc.", "VALIDATION");
    if (!/^[A-Za-z0-9]{2,6}$/.test(input.tag)) {
      throw new GuildError("Tag guild phải từ 2-6 ký tự chữ và số.", "VALIDATION");
    }

    const existing = await this.repo.getGuildByTag(input.tag);
    if (existing) throw new GuildError("Tag guild đã tồn tại.", "TAG_TAKEN");

    const guild = await this.repo.createGuild(input);

    await this.repo.addMember(guild.id, input.ownerId, "OWNER");
    await this.repo.addLog({ guildId: guild.id, actorId: input.ownerId, action: "GUILD_CREATED", targetId: null, metadata: { guildName: guild.name } });

    this.reputationService.fire(input.ownerId, "GUILD_CREATED");
    this.activitiesService.fire({
      userId: input.ownerId, type: "social", title: "Guild đã được tạo",
      description: `Bạn đã tạo guild "${guild.name}" [${guild.tag}].`,
      metadata: { guildId: guild.id, guildName: guild.name }, sourceApp: "universe-guild",
    });

    questEventBus.publish({ userId: input.ownerId, type: "CREATE_GUILD", amount: 1, metadata: { guildId: guild.id, guildName: guild.name } });
    questEventBus.publish({ userId: input.ownerId, type: "JOIN_GUILD",   amount: 1, metadata: { guildId: guild.id, guildName: guild.name } });

    return guild;
  }

  async getGuild(id: string): Promise<Guild> {
    const guild = await this.repo.getGuildById(id);
    if (!guild) throw new GuildError("Guild không tồn tại.", "NOT_FOUND", 404);
    return guild;
  }

  async listGuilds(options?: { search?: string; limit?: number; offset?: number }): Promise<Guild[]> {
    return this.repo.listGuilds(options);
  }

  async updateGuild(guildId: string, actorId: string, input: UpdateGuildInput): Promise<Guild> {
    const guild  = await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, actorId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    if (ROLE_RANK[member.role] < ROLE_RANK["LEADER"]) {
      throw new GuildError("Chỉ Leader hoặc Owner mới có thể cập nhật guild.", "FORBIDDEN", 403);
    }

    const updated = await this.repo.updateGuild(guildId, input);
    await this.repo.addLog({ guildId, actorId, action: "GUILD_UPDATED", targetId: null, metadata: input });
    return updated ?? guild;
  }

  async deleteGuild(guildId: string, actorId: string): Promise<void> {
    const guild  = await this.getGuild(guildId);
    if (guild.ownerId !== actorId) {
      throw new GuildError("Chỉ Owner mới có thể xóa guild.", "FORBIDDEN", 403);
    }
    await this.repo.deleteGuild(guildId);
  }

  // ── Members ──────────────────────────────────────────────────────────────────

  async getMembers(guildId: string): Promise<GuildMember[]> {
    await this.getGuild(guildId);
    return this.repo.getMembers(guildId);
  }

  async invite(guildId: string, inviterId: string, inviteeId: string): Promise<GuildInvite> {
    await this.getGuild(guildId);
    const inviterMember = await this.repo.getMember(guildId, inviterId);
    if (!inviterMember) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(inviterMember.role, "INVITE");

    const alreadyMember = await this.repo.getMember(guildId, inviteeId);
    if (alreadyMember) throw new GuildError("Người dùng đã là thành viên guild.", "ALREADY_MEMBER");

    const hasInvite = await this.repo.hasActiveInvite(guildId, inviteeId);
    if (hasInvite) throw new GuildError("Người dùng đã có lời mời chờ xử lý.", "DUPLICATE_INVITE");

    const invite = await this.repo.createInvite(guildId, inviterId, inviteeId);
    await this.repo.addLog({ guildId, actorId: inviterId, action: "MEMBER_INVITED", targetId: inviteeId, metadata: null });

    this.notifService.fire(inviteeId, "social", "Lời mời tham gia guild", `Bạn đã được mời tham gia guild.`);
    this.activitiesService.fire({
      userId: inviterId, type: "social", title: "Đã gửi lời mời guild",
      description: "Đã gửi lời mời tham gia guild.", metadata: { guildId, inviteeId }, sourceApp: "universe-guild",
    });
    this.reputationService.fire(inviterId, "GUILD_RECRUIT");
    return invite;
  }

  async joinRequest(guildId: string, userId: string, message?: string): Promise<GuildJoinRequest> {
    const guild = await this.getGuild(guildId);
    if (guild.visibility === "PRIVATE") throw new GuildError("Guild này không cho phép tham gia trực tiếp.", "FORBIDDEN", 403);

    const alreadyMember = await this.repo.getMember(guildId, userId);
    if (alreadyMember) throw new GuildError("Bạn đã là thành viên guild.", "ALREADY_MEMBER");

    const hasRequest = await this.repo.hasActiveJoinRequest(guildId, userId);
    if (hasRequest) throw new GuildError("Bạn đã có yêu cầu tham gia đang chờ xử lý.", "DUPLICATE_REQUEST");

    const memberCount = await this.repo.getMemberCount(guildId);
    if (memberCount >= guild.memberLimit) throw new GuildError("Guild đã đầy thành viên.", "GUILD_FULL");

    const req = await this.repo.createJoinRequest(guildId, userId, message);
    await this.repo.addLog({ guildId, actorId: userId, action: "JOIN_REQUEST_SENT", targetId: null, metadata: null });

    this.activitiesService.fire({
      userId, type: "social", title: "Đã gửi yêu cầu tham gia guild",
      description: `Đã gửi yêu cầu tham gia guild "${guild.name}".`,
      metadata: { guildId, requestId: req.id }, sourceApp: "universe-guild",
    });
    return req;
  }

  async approveJoin(guildId: string, approverId: string, requestId: string): Promise<GuildMember> {
    const guild  = await this.getGuild(guildId);
    const approver = await this.repo.getMember(guildId, approverId);
    if (!approver) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(approver.role, "APPROVE_JOIN");

    const req = await this.repo.getJoinRequest(requestId);
    if (!req || req.guildId !== guildId) throw new GuildError("Yêu cầu không tồn tại.", "NOT_FOUND", 404);
    if (req.status !== "PENDING") throw new GuildError("Yêu cầu không còn ở trạng thái chờ.", "INVALID_STATUS");

    const memberCount = await this.repo.getMemberCount(guildId);
    if (memberCount >= guild.memberLimit) throw new GuildError("Guild đã đầy thành viên.", "GUILD_FULL");

    await this.repo.updateJoinRequestStatus(requestId, "APPROVED");
    const member = await this.repo.addMember(guildId, req.userId, "RECRUIT");
    await this.repo.addLog({ guildId, actorId: approverId, action: "JOIN_REQUEST_APPROVED", targetId: req.userId, metadata: null });

    this.reputationService.fire(req.userId, "GUILD_JOINED");
    this.notifService.fire(req.userId, "social", "Yêu cầu tham gia guild được chấp thuận", `Yêu cầu tham gia guild "${guild.name}" đã được chấp thuận.`);
    this.activitiesService.fire({
      userId: req.userId, type: "social", title: "Đã tham gia guild",
      description: `Đã tham gia guild "${guild.name}".`, metadata: { guildId }, sourceApp: "universe-guild",
    });

    questEventBus.publish({ userId: req.userId, type: "JOIN_GUILD", amount: 1, metadata: { guildId } });

    return member;
  }

  async rejectJoin(guildId: string, rejecterId: string, requestId: string): Promise<GuildJoinRequest> {
    const approver = await this.repo.getMember(guildId, rejecterId);
    if (!approver) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(approver.role, "APPROVE_JOIN");

    const req = await this.repo.getJoinRequest(requestId);
    if (!req || req.guildId !== guildId) throw new GuildError("Yêu cầu không tồn tại.", "NOT_FOUND", 404);
    if (req.status !== "PENDING") throw new GuildError("Yêu cầu không còn ở trạng thái chờ.", "INVALID_STATUS");

    const updated = await this.repo.updateJoinRequestStatus(requestId, "REJECTED");
    await this.repo.addLog({ guildId, actorId: rejecterId, action: "JOIN_REQUEST_REJECTED", targetId: req.userId, metadata: null });

    this.notifService.fire(req.userId, "social", "Yêu cầu tham gia guild bị từ chối", "Yêu cầu tham gia guild của bạn đã bị từ chối.");
    return updated!;
  }

  async acceptInvite(inviteId: string, userId: string): Promise<GuildMember> {
    const invite = await this.repo.getInvite(inviteId);
    if (!invite) throw new GuildError("Lời mời không tồn tại.", "NOT_FOUND", 404);
    if (invite.inviteeId !== userId) throw new GuildError("Lời mời không dành cho bạn.", "FORBIDDEN", 403);
    if (invite.status !== "PENDING") throw new GuildError("Lời mời không còn hiệu lực.", "INVALID_STATUS");

    const guild = await this.getGuild(invite.guildId);
    const memberCount = await this.repo.getMemberCount(invite.guildId);
    if (memberCount >= guild.memberLimit) throw new GuildError("Guild đã đầy thành viên.", "GUILD_FULL");

    await this.repo.updateInviteStatus(inviteId, "ACCEPTED");
    const member = await this.repo.addMember(invite.guildId, userId, "RECRUIT");
    await this.repo.addLog({ guildId: invite.guildId, actorId: userId, action: "INVITE_ACCEPTED", targetId: invite.inviterId, metadata: null });

    this.reputationService.fire(userId, "GUILD_JOINED");
    this.notifService.fire(invite.inviterId, "social", "Lời mời guild được chấp nhận", `Người dùng đã chấp nhận lời mời vào guild "${guild.name}".`);
    this.activitiesService.fire({
      userId, type: "social", title: "Đã tham gia guild qua lời mời",
      description: `Đã tham gia guild "${guild.name}" qua lời mời.`, metadata: { guildId: invite.guildId }, sourceApp: "universe-guild",
    });

    questEventBus.publish({ userId, type: "JOIN_GUILD", amount: 1, metadata: { guildId: invite.guildId } });

    return member;
  }

  async leaveGuild(guildId: string, userId: string): Promise<void> {
    const guild  = await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, userId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "NOT_MEMBER", 404);
    if (member.role === "OWNER") throw new GuildError("Owner không thể rời guild. Hãy chuyển quyền sở hữu trước.", "OWNER_CANNOT_LEAVE");

    await this.repo.removeMember(guildId, userId);
    await this.repo.addLog({ guildId, actorId: userId, action: "MEMBER_LEFT", targetId: null, metadata: null });

    this.activitiesService.fire({
      userId, type: "social", title: "Đã rời guild",
      description: `Đã rời guild "${guild.name}".`, metadata: { guildId }, sourceApp: "universe-guild",
    });
  }

  async kickMember(guildId: string, kickerId: string, targetUserId: string): Promise<void> {
    const guild  = await this.getGuild(guildId);
    if (kickerId === targetUserId) throw new GuildError("Không thể kick chính mình.", "SELF_KICK");

    const kicker = await this.repo.getMember(guildId, kickerId);
    if (!kicker) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(kicker.role, "KICK");

    const target = await this.repo.getMember(guildId, targetUserId);
    if (!target) throw new GuildError("Thành viên không tồn tại.", "NOT_FOUND", 404);
    if (target.role === "OWNER") throw new GuildError("Không thể kick Owner.", "CANNOT_KICK_OWNER");
    assertHigherRank(kicker.role, target.role);

    await this.repo.removeMember(guildId, targetUserId);
    await this.repo.addLog({ guildId, actorId: kickerId, action: "MEMBER_KICKED", targetId: targetUserId, metadata: null });

    this.notifService.fire(targetUserId, "social", "Bạn đã bị kick khỏi guild", `Bạn đã bị kick khỏi guild "${guild.name}".`);
    this.activitiesService.fire({
      userId: kickerId, type: "social", title: "Đã kick thành viên",
      description: "Đã kick một thành viên khỏi guild.", metadata: { guildId, targetUserId }, sourceApp: "universe-guild",
    });
  }

  async changeMemberRole(guildId: string, actorId: string, targetUserId: string, newRole: GuildRole): Promise<GuildMember> {
    if (newRole === "OWNER") throw new GuildError("Không thể gán vai trò OWNER qua đây.", "FORBIDDEN", 403);
    if (actorId === targetUserId) throw new GuildError("Không thể thay đổi vai trò của chính mình.", "SELF_ROLE");

    const actor  = await this.repo.getMember(guildId, actorId);
    if (!actor)  throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(actor.role, "MANAGE_ROLES");

    const target = await this.repo.getMember(guildId, targetUserId);
    if (!target) throw new GuildError("Thành viên không tồn tại.", "NOT_FOUND", 404);
    if (target.role === "OWNER") throw new GuildError("Không thể thay đổi vai trò của Owner.", "CANNOT_CHANGE_OWNER");
    assertHigherRank(actor.role, target.role);
    if (ROLE_RANK[newRole] >= ROLE_RANK[actor.role]) {
      throw new GuildError("Không thể gán vai trò cao hơn hoặc bằng vai trò của bạn.", "FORBIDDEN", 403);
    }

    const updated = await this.repo.updateMemberRole(guildId, targetUserId, newRole);
    await this.repo.addLog({
      guildId, actorId, action: ROLE_RANK[newRole] > ROLE_RANK[target.role] ? "ROLE_CHANGED" : "ROLE_CHANGED",
      targetId: targetUserId, metadata: { oldRole: target.role, newRole },
    });

    const isPromotion = ROLE_RANK[newRole] > ROLE_RANK[target.role];
    this.notifService.fire(targetUserId, "social",
      isPromotion ? "Bạn đã được thăng cấp trong guild" : "Vai trò guild của bạn đã thay đổi",
      `Vai trò của bạn đã được thay đổi thành ${newRole}.`,
    );
    return updated!;
  }

  // ── Announcements ────────────────────────────────────────────────────────────

  async postAnnouncement(guildId: string, authorId: string, title: string, content: string, isPinned = false): Promise<GuildAnnouncement> {
    const guild  = await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, authorId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(member.role, "POST_ANNOUNCEMENT");

    const ann = await this.repo.createAnnouncement({ guildId, authorId, title, content, isPinned });
    await this.repo.addLog({ guildId, actorId: authorId, action: "ANNOUNCEMENT_POSTED", targetId: ann.id, metadata: { title } });

    this.reputationService.fire(authorId, "GUILD_ANNOUNCEMENT");
    const members = await this.repo.getMembers(guildId);
    for (const m of members) {
      if (m.userId === authorId) continue;
      this.notifService.fire(m.userId, "social", `Thông báo guild: ${guild.name}`, title);
    }
    return ann;
  }

  async getAnnouncements(guildId: string): Promise<GuildAnnouncement[]> {
    await this.getGuild(guildId);
    return this.repo.getAnnouncements(guildId);
  }

  // ── Contributions ────────────────────────────────────────────────────────────

  async contribute(guildId: string, userId: string, type: "CREDITS" | "COINS" | "ITEM", amount: number, itemId?: string, note?: string): Promise<GuildContribution> {
    await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, userId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    if (amount <= 0) throw new GuildError("Số lượng đóng góp phải lớn hơn 0.", "VALIDATION");

    const contribution = await this.repo.addContribution({ guildId, userId, type, amount, itemId: itemId ?? null, note: note ?? null });

    await this.repo.addContributionPoints(guildId, userId, amount);
    if (type === "CREDITS") await this.repo.updateTreasury(guildId, amount, 0);
    else if (type === "COINS") await this.repo.updateTreasury(guildId, 0, amount);
    else if (type === "ITEM" && itemId) {
      await this.repo.depositItem({ guildId, itemId, itemName: note ?? itemId, quantity: amount, depositedBy: userId });
      await this.repo.addLog({ guildId, actorId: userId, action: "WAREHOUSE_DEPOSIT", targetId: itemId, metadata: { quantity: amount, itemId } });
    }

    if (type === "CREDITS" || type === "COINS") {
      await this.repo.addTreasuryTransaction({ guildId, userId, type: "DEPOSIT", currency: type, amount, note: note ?? null });
      await this.repo.addLog({ guildId, actorId: userId, action: "TREASURY_DEPOSIT", targetId: null, metadata: { type, amount } });
    }

    this.reputationService.fire(userId, "GUILD_CONTRIBUTION");
    this.activitiesService.fire({
      userId, type: "social", title: "Đã đóng góp cho guild",
      description: `Đóng góp ${amount} ${type} vào guild.`, metadata: { guildId, type, amount }, sourceApp: "universe-guild",
    });

    questEventBus.publish({ userId, type: "GUILD_CONTRIBUTION", amount: 1, metadata: { guildId, contributionType: type, amount } });

    return contribution;
  }

  async getContributions(guildId: string): Promise<GuildContribution[]> {
    await this.getGuild(guildId);
    return this.repo.getContributions(guildId);
  }

  // ── Treasury ─────────────────────────────────────────────────────────────────

  async withdrawTreasury(guildId: string, userId: string, currency: "CREDITS" | "COINS", amount: number, note?: string): Promise<Guild> {
    const guild  = await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, userId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(member.role, "MANAGE_BANK");

    if (currency === "CREDITS" && guild.treasuryCredits < amount) throw new GuildError("Kho bạc không đủ Credits.", "INSUFFICIENT_FUNDS");
    if (currency === "COINS"   && guild.treasuryCoins   < amount) throw new GuildError("Kho bạc không đủ Coins.", "INSUFFICIENT_FUNDS");

    const deltaCredits = currency === "CREDITS" ? -amount : 0;
    const deltaCoins   = currency === "COINS"   ? -amount : 0;
    const updated = await this.repo.updateTreasury(guildId, deltaCredits, deltaCoins);
    await this.repo.addTreasuryTransaction({ guildId, userId, type: "WITHDRAW", currency, amount, note: note ?? null });
    await this.repo.addLog({ guildId, actorId: userId, action: "TREASURY_WITHDRAW", targetId: null, metadata: { currency, amount } });

    this.notifService.fire(userId, "social", "Rút kho bạc guild", `Đã rút ${amount} ${currency} từ kho bạc guild.`);
    this.activitiesService.fire({
      userId, type: "social", title: "Rút kho bạc guild",
      description: `Rút ${amount} ${currency} từ kho bạc guild.`, metadata: { guildId, currency, amount }, sourceApp: "universe-guild",
    });
    return updated ?? guild;
  }

  async getTreasuryTransactions(guildId: string): Promise<GuildTreasuryTransaction[]> {
    await this.getGuild(guildId);
    return this.repo.getTreasuryTransactions(guildId);
  }

  // ── Warehouse ────────────────────────────────────────────────────────────────

  async getWarehouseItems(guildId: string): Promise<GuildWarehouseItem[]> {
    await this.getGuild(guildId);
    return this.repo.getWarehouseItems(guildId);
  }

  async withdrawWarehouseItem(guildId: string, userId: string, itemId: string, quantity: number): Promise<void> {
    await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, userId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(member.role, "MANAGE_BANK");

    await this.repo.withdrawItem(guildId, itemId, quantity);
    await this.repo.addLog({ guildId, actorId: userId, action: "WAREHOUSE_WITHDRAW", targetId: itemId, metadata: { quantity } });

    this.notifService.fire(userId, "social", "Rút vật phẩm từ kho guild", `Đã rút ${quantity} vật phẩm từ kho guild.`);
    this.activitiesService.fire({
      userId, type: "social", title: "Rút vật phẩm kho guild",
      description: `Rút ${quantity} vật phẩm từ kho guild.`, metadata: { guildId, itemId, quantity }, sourceApp: "universe-guild",
    });
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  async createEvent(guildId: string, creatorId: string, data: Omit<GuildEvent, "id" | "createdAt" | "guildId" | "creatorId">): Promise<GuildEvent> {
    await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, creatorId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(member.role, "MANAGE_EVENTS");

    const event = await this.repo.createEvent({ guildId, creatorId, ...data });
    await this.repo.addLog({ guildId, actorId: creatorId, action: "EVENT_CREATED", targetId: event.id, metadata: { title: event.title } });

    this.reputationService.fire(creatorId, "GUILD_EVENT");
    const members = await this.repo.getMembers(guildId);
    for (const m of members) {
      if (m.userId === creatorId) continue;
      this.notifService.fire(m.userId, "social", "Sự kiện guild mới", `Sự kiện mới "${event.title}" đã được tạo.`);
    }
    this.activitiesService.fire({
      userId: creatorId, type: "social", title: "Tạo sự kiện guild",
      description: `Đã tạo sự kiện "${event.title}".`, metadata: { guildId, eventId: event.id }, sourceApp: "universe-guild",
    });
    return event;
  }

  async getEvents(guildId: string): Promise<GuildEvent[]> {
    await this.getGuild(guildId);
    return this.repo.getEvents(guildId);
  }

  async joinEvent(guildId: string, eventId: string, userId: string): Promise<void> {
    await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, userId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);

    const event = await this.repo.getEventById(eventId);
    if (!event || event.guildId !== guildId) throw new GuildError("Sự kiện không tồn tại.", "NOT_FOUND", 404);
    if (event.status !== "UPCOMING" && event.status !== "ONGOING") {
      throw new GuildError("Sự kiện không còn mở đăng ký.", "INVALID_STATUS");
    }

    const alreadyJoined = await this.repo.hasJoinedEvent(eventId, userId);
    if (alreadyJoined) throw new GuildError("Bạn đã tham gia sự kiện này.", "ALREADY_JOINED");

    if (event.maxParticipants) {
      const participants = await this.repo.getEventParticipants(eventId);
      if (participants.length >= event.maxParticipants) throw new GuildError("Sự kiện đã đầy.", "EVENT_FULL");
    }

    await this.repo.joinEvent(eventId, userId);
    await this.repo.addLog({ guildId, actorId: userId, action: "EVENT_JOINED", targetId: eventId, metadata: { title: event.title } });

    this.activitiesService.fire({
      userId, type: "social", title: "Tham gia sự kiện guild",
      description: `Đã tham gia sự kiện "${event.title}".`, metadata: { guildId, eventId }, sourceApp: "universe-guild",
    });
  }

  // ── Logs ─────────────────────────────────────────────────────────────────────

  async getLogs(guildId: string, actorId: string): Promise<GuildLog[]> {
    await this.getGuild(guildId);
    const member = await this.repo.getMember(guildId, actorId);
    if (!member) throw new GuildError("Bạn không phải thành viên guild.", "FORBIDDEN", 403);
    assertPermission(member.role, "VIEW_LOGS");
    return this.repo.getLogs(guildId);
  }

  // ── Dashboard helpers ─────────────────────────────────────────────────────────

  async getUserGuild(userId: string): Promise<{ guild: Guild; member: GuildMember } | null> {
    return this.repo.getUserGuild(userId);
  }

  async getLeaderboard(limit = 20): Promise<Guild[]> {
    return this.repo.getLeaderboard(limit);
  }
}
