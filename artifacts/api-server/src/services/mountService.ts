// ─────────────────────────────────────────────────────────────────────────────
// MountService — HUB-20
// ─────────────────────────────────────────────────────────────────────────────

import type { IMountRepository, CreateMountInput } from "../repositories/petRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { petEventBus } from "./petEventBus.js";

export class MountError extends Error {
  constructor(message: string, public code = "MOUNT_ERROR", public status = 400) {
    super(message); this.name = "MountError";
  }
}

export class MountService {
  constructor(
    private readonly repo:           IMountRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Types ──────────────────────────────────────────────────────────────────

  async listMountTypes() { return this.repo.listMountTypes(); }

  // ── Mount CRUD ─────────────────────────────────────────────────────────────

  async createMount(userId: string, input: Omit<CreateMountInput, "userId">) {
    const mount = await this.repo.createMount({ ...input, userId });

    petEventBus.publish({ type: "MOUNT_CREATED", userId, entityId: mount.id, payload: { name: mount.name, type: mount.type, rarity: mount.rarity } });

    await this.notifService.send(userId, { title: "🐴 Chiến kỵ mới!", message: `Bạn đã có mount: ${mount.name}!`, type: "system" as never });

    this.actService.fire({ userId, type: "system" as never, title: `Tạo mount: ${mount.name}`, description: `${mount.type} · ${mount.rarity}`, metadata: { mountId: mount.id } });

    await this.reputationRepo.updateReputation(userId, { reason: "first_mount", delta: 15 });

    return mount;
  }

  async listMounts(userId: string) { return this.repo.listMounts(userId); }

  async getMount(mountId: string) {
    const mount = await this.repo.getMount(mountId);
    if (!mount) throw new MountError("Mount không tồn tại", "NOT_FOUND", 404);
    return mount;
  }

  async getActiveMount(userId: string) { return this.repo.getActiveMount(userId); }

  // ── Train ──────────────────────────────────────────────────────────────────

  async trainMount(userId: string, mountId: string, trainingType = "speed") {
    const mount = await this.repo.getMount(mountId);
    if (!mount) throw new MountError("Mount không tồn tại", "NOT_FOUND", 404);
    if (mount.userId !== userId) throw new MountError("Không có quyền", "FORBIDDEN", 403);

    const result = await this.repo.trainMount(mountId, userId, trainingType);

    petEventBus.publish({ type: "MOUNT_TRAINED", userId, entityId: mountId, payload: { trainingType, xpGained: result.training.xpGained } });

    this.actService.fire({ userId, type: "system" as never, title: `Huấn luyện ${mount.name}`, description: `${trainingType} — XP +${result.training.xpGained}`, metadata: { mountId } });

    const { leveled, newLevel } = await this.repo.gainXp(mountId, result.training.xpGained);
    if (leveled) {
      petEventBus.publish({ type: "MOUNT_LEVEL_UP", userId, entityId: mountId, payload: { newLevel } });
      await this.notifService.send(userId, { title: "🎉 Mount lên cấp!", message: `${mount.name} đã lên cấp ${newLevel}!`, type: "system" as never });
    }

    return { ...result, leveled, newLevel };
  }

  // ── Equip ──────────────────────────────────────────────────────────────────

  async equipMount(userId: string, mountId: string, slot: string, itemId: string, itemName: string, itemIcon?: string, itemRarity?: string, statBonus?: Record<string, number>) {
    const mount = await this.repo.getMount(mountId);
    if (!mount) throw new MountError("Mount không tồn tại", "NOT_FOUND", 404);
    if (mount.userId !== userId) throw new MountError("Không có quyền", "FORBIDDEN", 403);

    const equipment = await this.repo.equipMount(mountId, slot, itemId, itemName, itemIcon, itemRarity, statBonus);

    petEventBus.publish({ type: "MOUNT_EQUIPPED", userId, entityId: mountId, payload: { slot, itemName } });
    this.actService.fire({ userId, type: "system" as never, title: `Trang bị cho ${mount.name}`, description: `${slot}: ${itemName}`, metadata: { mountId } });

    return equipment;
  }

  async unequipMount(userId: string, mountId: string, slot: string) {
    const mount = await this.repo.getMount(mountId);
    if (!mount) throw new MountError("Mount không tồn tại", "NOT_FOUND", 404);
    if (mount.userId !== userId) throw new MountError("Không có quyền", "FORBIDDEN", 403);
    await this.repo.unequipMount(mountId, slot);
    return { ok: true };
  }

  async getEquipment(mountId: string) { return this.repo.getEquipment(mountId); }

  // ── Travel ─────────────────────────────────────────────────────────────────

  async travel(userId: string, mountId: string, routeId: string) {
    const mount = await this.repo.getMount(mountId);
    if (!mount) throw new MountError("Mount không tồn tại", "NOT_FOUND", 404);
    if (mount.userId !== userId) throw new MountError("Không có quyền", "FORBIDDEN", 403);
    if (mount.status === "TRAVELING") throw new MountError("Mount đang trong hành trình", "ALREADY_TRAVELING", 400);
    if (mount.stamina < 10) throw new MountError("Mount quá mệt, cần nghỉ ngơi", "LOW_STAMINA", 400);

    const route = await this.repo.getRoute(routeId);
    if (!route) throw new MountError("Tuyến đường không tồn tại", "NOT_FOUND", 404);

    const travelLog = await this.repo.travel(mountId, userId, routeId);

    petEventBus.publish({ type: "MOUNT_TRAVEL", userId, entityId: mountId, payload: { routeId, origin: route.origin, destination: route.destination, duration: travelLog.duration } });

    this.actService.fire({ userId, type: "system" as never, title: `${mount.name} khởi hành`, description: `${route.origin} → ${route.destination}`, metadata: { mountId, routeId } });

    setTimeout(async () => {
      try {
        const arrived = await this.repo.arriveTravel(travelLog.id);
        petEventBus.publish({ type: "MOUNT_ARRIVED", userId, entityId: mountId, payload: { destination: arrived.destination, xpGained: arrived.xpGained } });
        await this.notifService.send(userId, { title: "🏁 Đến nơi!", message: `${mount.name} đã đến ${route.destination}!`, type: "system" as never });
      } catch {}
    }, travelLog.duration * 1000);

    return travelLog;
  }

  // ── Routes ─────────────────────────────────────────────────────────────────

  async listRoutes() { return this.repo.listRoutes(); }

  // ── Statistics ─────────────────────────────────────────────────────────────

  async getStatistics(userId: string) { return this.repo.getStatistics(userId); }

  // ── Customization ──────────────────────────────────────────────────────────

  async getCustomization(mountId: string) { return this.repo.getCustomization(mountId); }

  async updateCustomization(userId: string, mountId: string, data: Record<string, unknown>) {
    const mount = await this.repo.getMount(mountId);
    if (!mount) throw new MountError("Mount không tồn tại", "NOT_FOUND", 404);
    if (mount.userId !== userId) throw new MountError("Không có quyền", "FORBIDDEN", 403);
    return this.repo.updateCustomization(mountId, data as never);
  }

  // ── Travel logs ────────────────────────────────────────────────────────────

  async getTravelLogs(userId: string) { return this.repo.getTravelLogs(userId); }
}
