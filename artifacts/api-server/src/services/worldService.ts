import { randomUUID } from "node:crypto";
import type { IWorldRepository, World, WorldMember, WorldInstance, CreateWorldInput, UpdateWorldInput, ListWorldsOptions } from "../repositories/worldRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService } from "./activitiesService.js";
import type { UserReputationService } from "./userReputationService.js";
import { questEventBus } from "../realtime/questEventBus.js";
import { worldEventBus } from "../realtime/worldEventBus.js";

export class WorldError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "WorldError";
  }
}

export class WorldService {
  constructor(
    private readonly repo: IWorldRepository,
    private readonly notifService: NotificationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly reputationService: UserReputationService,
  ) {}

  // ── World CRUD ───────────────────────────────────────────────────────────────

  async createWorld(input: CreateWorldInput): Promise<World> {
    if (!input.name?.trim()) throw new WorldError("Tên world là bắt buộc.", "VALIDATION");
    if (input.name.length > 100) throw new WorldError("Tên world tối đa 100 ký tự.", "VALIDATION");

    const world = await this.repo.createWorld(input);

    await this.repo.addMember(world.id, input.ownerId, "OWNER");

    this.reputationService.fire(input.ownerId, "GUILD_CREATED");
    this.activitiesService.fire({
      userId:    input.ownerId,
      type:      "social",
      title:     "World đã được tạo",
      description: `Bạn đã tạo world "${world.name}".`,
      metadata:  { worldId: world.id, worldName: world.name },
      sourceApp: "universe-worlds",
    });
    questEventBus.publish({ userId: input.ownerId, type: "WORLD_TRAVEL", amount: 1, metadata: { worldId: world.id } });

    worldEventBus.publish({ type: "WORLD_CREATED", userId: input.ownerId, worldId: world.id, payload: { world }, timestamp: new Date().toISOString() });

    return world;
  }

  async getWorld(id: string): Promise<World> {
    const world = await this.repo.getWorldById(id);
    if (!world) throw new WorldError("World không tồn tại.", "NOT_FOUND", 404);
    return world;
  }

  async getWorldBySlug(slug: string): Promise<World> {
    const world = await this.repo.getWorldBySlug(slug);
    if (!world) throw new WorldError("World không tồn tại.", "NOT_FOUND", 404);
    return world;
  }

  async listWorlds(options?: ListWorldsOptions): Promise<{ worlds: World[]; total: number }> {
    const [worlds, total] = await Promise.all([
      this.repo.listWorlds(options),
      this.repo.countWorlds(options),
    ]);
    return { worlds, total };
  }

  async getFeaturedWorlds(limit = 10): Promise<World[]> {
    return this.repo.listWorlds({ isFeatured: true, limit, sortBy: "playerCount", sortDir: "desc" });
  }

  async getPopularWorlds(limit = 20): Promise<World[]> {
    return this.repo.listWorlds({ limit, sortBy: "playerCount", sortDir: "desc" });
  }

  async getRecentWorlds(limit = 20): Promise<World[]> {
    return this.repo.listWorlds({ limit, sortBy: "createdAt", sortDir: "desc" });
  }

  async searchWorlds(query: string, limit = 20): Promise<World[]> {
    return this.repo.listWorlds({ search: query, limit });
  }

  async updateWorld(worldId: string, userId: string, input: UpdateWorldInput): Promise<World> {
    const world = await this.getWorld(worldId);
    const member = await this.repo.getMember(worldId, userId);
    if (world.ownerId !== userId && member?.role !== "ADMIN") {
      throw new WorldError("Chỉ chủ sở hữu hoặc admin mới có thể chỉnh sửa world.", "FORBIDDEN", 403);
    }
    const updated = await this.repo.updateWorld(worldId, input);
    if (!updated) throw new WorldError("Cập nhật world thất bại.", "UPDATE_FAILED");

    worldEventBus.publish({ type: "WORLD_UPDATED", userId, worldId, payload: { world: updated }, timestamp: new Date().toISOString() });
    return updated;
  }

  async deleteWorld(worldId: string, userId: string): Promise<void> {
    const world = await this.getWorld(worldId);
    if (world.ownerId !== userId) throw new WorldError("Chỉ chủ sở hữu mới có thể xóa world.", "FORBIDDEN", 403);
    await this.repo.deleteWorld(worldId);
    worldEventBus.publish({ type: "WORLD_DELETED", userId, worldId, payload: { worldId }, timestamp: new Date().toISOString() });
  }

  // ── Join / Leave / Travel ────────────────────────────────────────────────────

  async joinWorld(worldId: string, userId: string): Promise<{ world: World; instance: WorldInstance; member: WorldMember }> {
    const world = await this.getWorld(worldId);

    if (world.type === "PRIVATE") {
      const member = await this.repo.getMember(worldId, userId);
      if (!member) throw new WorldError("World này là riêng tư. Bạn cần được mời.", "FORBIDDEN", 403);
    }

    let instance = await this.repo.getOpenInstance(worldId);
    if (!instance) {
      instance = await this._createAutoInstance(worldId);
    }

    await this.repo.updateInstancePlayerCount(instance.id, 1);
    await this.repo.incrementPlayerCount(worldId, 1);
    await this.repo.incrementVisitCount(worldId);

    const member = await this.repo.addMember(worldId, userId);
    await this.repo.updateMemberVisit(worldId, userId);

    await this.repo.upsertPresence(userId, {
      worldId, instanceId: instance.id, joinedAt: new Date().toISOString(), isOnline: true,
    });

    const active = await this.repo.getActiveTravelHistory(userId);
    if (active) await this.repo.closeTravelHistory(active.id);
    await this.repo.addTravelHistory({ userId, worldId, instanceId: instance.id });

    this.activitiesService.fire({
      userId, type: "social", title: "Tham gia World",
      description: `Bạn đã vào world "${world.name}".`,
      metadata: { worldId, worldName: world.name }, sourceApp: "universe-worlds",
    });
    questEventBus.publish({ userId, type: "JOIN_WORLD", amount: 1, metadata: { worldId, worldName: world.name } });
    questEventBus.publish({ userId, type: "WORLD_TRAVEL", amount: 1, metadata: { worldId } });

    worldEventBus.publish({ type: "WORLD_JOINED", userId, worldId, payload: { userId, worldId, instanceId: instance.id }, timestamp: new Date().toISOString() });
    worldEventBus.publish({ type: "PLAYER_ENTER", userId, worldId, payload: { userId, worldId, instanceId: instance.id }, timestamp: new Date().toISOString() });
    worldEventBus.publish({ type: "PRESENCE_UPDATED", userId, worldId, payload: { userId, worldId, isOnline: true }, timestamp: new Date().toISOString() });

    this._notifyFriendsInWorld(userId, world).catch(() => {});

    return { world, instance, member };
  }

  async leaveWorld(worldId: string, userId: string): Promise<void> {
    const world = await this.repo.getWorldById(worldId);
    const presence = await this.repo.getPresence(userId);

    if (presence?.instanceId) {
      await this.repo.updateInstancePlayerCount(presence.instanceId, -1);
      const inst = await this.repo.getInstance(presence.instanceId);
      if (inst && inst.playerCount <= 0) {
        await this.repo.closeInstance(inst.id);
        worldEventBus.publish({ type: "INSTANCE_CLOSED", worldId, payload: { instanceId: inst.id }, timestamp: new Date().toISOString() });
      }
    }

    await this.repo.incrementPlayerCount(worldId, -1);
    await this.repo.clearPresence(userId);

    const active = await this.repo.getActiveTravelHistory(userId);
    if (active) await this.repo.closeTravelHistory(active.id);

    worldEventBus.publish({ type: "WORLD_LEFT", userId, worldId, payload: { userId, worldId }, timestamp: new Date().toISOString() });
    worldEventBus.publish({ type: "PLAYER_EXIT", userId, worldId, payload: { userId, worldId }, timestamp: new Date().toISOString() });
    worldEventBus.publish({ type: "PRESENCE_UPDATED", userId, worldId, payload: { userId, worldId: null, isOnline: false }, timestamp: new Date().toISOString() });

    if (world) {
      this.activitiesService.fire({
        userId, type: "social", title: "Rời World",
        description: `Bạn đã rời world "${world.name}".`,
        metadata: { worldId, worldName: world.name }, sourceApp: "universe-worlds",
      });
    }
  }

  async travelToWorld(worldId: string, userId: string): Promise<{ world: World; instance: WorldInstance; member: WorldMember }> {
    const presence = await this.repo.getPresence(userId);
    if (presence?.worldId && presence.worldId !== worldId && presence.isOnline) {
      await this.leaveWorld(presence.worldId, userId);
    }

    const result = await this.joinWorld(worldId, userId);

    worldEventBus.publish({ type: "WORLD_TRAVEL", userId, worldId, payload: { userId, fromWorldId: presence?.worldId, toWorldId: worldId }, timestamp: new Date().toISOString() });
    questEventBus.publish({ userId, type: "VISIT_WORLD", amount: 1, metadata: { worldId } });

    this.activitiesService.fire({
      userId, type: "social", title: "Di chuyển World",
      description: `Bạn đã di chuyển đến world "${result.world.name}".`,
      metadata: { worldId, worldName: result.world.name }, sourceApp: "universe-worlds",
    });

    return result;
  }

  // ── Bookmarks ────────────────────────────────────────────────────────────────

  async addBookmark(worldId: string, userId: string) {
    await this.getWorld(worldId);
    return this.repo.addBookmark(worldId, userId);
  }

  async removeBookmark(worldId: string, userId: string) {
    return this.repo.removeBookmark(worldId, userId);
  }

  async listBookmarks(userId: string) {
    return this.repo.listBookmarks(userId);
  }

  // ── Members / Presence ───────────────────────────────────────────────────────

  async listMembers(worldId: string): Promise<WorldMember[]> {
    await this.getWorld(worldId);
    return this.repo.listMembers(worldId);
  }

  async listPresence(worldId: string) {
    return this.repo.listWorldPresence(worldId);
  }

  // ── Travel History ───────────────────────────────────────────────────────────

  async listTravelHistory(userId: string, limit = 20) {
    return this.repo.listTravelHistory(userId, limit);
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  async listWorldEvents(worldId: string) {
    return this.repo.listEvents(worldId);
  }

  async createWorldEvent(worldId: string, userId: string, input: { name: string; description?: string; startAt: string; endAt?: string; maxParticipants?: number }) {
    await this.getWorld(worldId);
    return this.repo.createEvent({ ...input, worldId, creatorId: userId });
  }

  // ── Dashboard data ───────────────────────────────────────────────────────────

  async getDashboardData(userId: string) {
    const [presence, bookmarks, travelHistory, popular] = await Promise.all([
      this.repo.getPresence(userId),
      this.repo.listBookmarks(userId),
      this.repo.listTravelHistory(userId, 5),
      this.repo.listWorlds({ sortBy: "playerCount", sortDir: "desc", limit: 5 }),
    ]);

    let currentWorld: World | null = null;
    if (presence?.worldId) currentWorld = await this.repo.getWorldById(presence.worldId);

    const totalOnline = await this.repo.listWorlds({ limit: 1000 }).then(ws =>
      ws.reduce((sum, w) => sum + w.playerCount, 0)
    );

    return { currentWorld, presence, bookmarks, recentHistory: travelHistory, popularWorlds: popular, totalOnline };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async _createAutoInstance(worldId: string): Promise<WorldInstance> {
    const world = await this.repo.getWorldById(worldId);
    const inst = await this.repo.createInstance({ zoneId: `zone-default-${worldId}`, worldId, type: "SHARED", capacity: world?.capacity ?? 100 });
    worldEventBus.publish({ type: "INSTANCE_CREATED", worldId, payload: { instanceId: inst.id }, timestamp: new Date().toISOString() });
    return inst;
  }

  private async _notifyFriendsInWorld(userId: string, world: World): Promise<void> {
    const presence = await this.repo.listWorldPresence(world.id);
    for (const p of presence) {
      if (p.userId === userId) continue;
      this.notifService.fire(p.userId, "social", "Bạn bè vào World", `Một người bạn vừa vào world "${world.name}".`);
    }
  }
}
