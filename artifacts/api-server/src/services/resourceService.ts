// ─────────────────────────────────────────────────────────────────────────────
// ResourceService — HUB-17
// ─────────────────────────────────────────────────────────────────────────────

import type { ICraftingRepository, ResourceNode, ResourceGatherLog } from "../repositories/craftingRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { craftingEventBus }              from "./craftingEventBus.js";

export class ResourceError extends Error {
  constructor(message: string, public code = "RESOURCE_ERROR", public status = 400) {
    super(message);
    this.name = "ResourceError";
  }
}

const TODAY = () => new Date().toISOString().split("T")[0]!;

export class ResourceService {
  constructor(
    private readonly repo:           ICraftingRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  async getNodes(worldId?: string): Promise<ResourceNode[]> {
    return this.repo.getResources(worldId);
  }

  async gatherResource(userId: string, nodeId: string, requestedAmount: number): Promise<ResourceGatherLog> {
    const node = await this.repo.getResource(nodeId);
    if (!node) throw new ResourceError(`Node không tồn tại: ${nodeId}`, "NODE_NOT_FOUND", 404);
    if (!node.isActive) throw new ResourceError("Node này hiện không hoạt động", "NODE_INACTIVE");
    if (node.currentAmount <= 0) throw new ResourceError("Node này đã cạn kiệt tài nguyên", "NODE_EMPTY");

    const amount = Math.min(requestedAmount, node.currentAmount, 10);
    const log = await this.repo.gather({ userId, nodeId, amount });

    craftingEventBus.publish({
      type: "RESOURCE_GATHERED", userId, nodeId,
      resourceType: node.resourceType, amount,
    });

    await this.repo.incrementStat(TODAY(), "totalGathered", amount);

    if (node.currentAmount - amount <= 0) {
      this._scheduleRespawn(node);
    }

    this.actService.fire({
      userId, type: "system" as any,
      title:       `Thu thập ${amount}x ${node.resourceType}`,
      description: `Từ node: ${node.name}`,
      metadata:    { nodeId, resourceType: node.resourceType, amount },
    });

    this.reputationRepo.addEvent({ userId, eventType: "INVENTORY_ACQUIRED" as any }).catch(() => {});

    return log;
  }

  private _scheduleRespawn(node: ResourceNode): void {
    setTimeout(async () => {
      const respawnAmount = Math.floor(node.maxAmount * 0.5);
      await this.repo.spawnResource(node.id, respawnAmount);
      craftingEventBus.publish({
        type: "RESOURCE_RESPAWNED",
        nodeId: node.id,
        resourceType: node.resourceType,
        amount: respawnAmount,
      });
    }, node.respawnTime * 1000);
  }

  async spawnResource(nodeId: string, amount: number): Promise<void> {
    const node = await this.repo.getResource(nodeId);
    if (!node) throw new ResourceError(`Node không tồn tại: ${nodeId}`, "NODE_NOT_FOUND", 404);
    await this.repo.spawnResource(nodeId, amount);
    craftingEventBus.publish({
      type: "RESOURCE_RESPAWNED",
      nodeId, resourceType: node.resourceType, amount,
    });
  }

  async getMarketPrices() {
    return this.repo.getMarketPrices();
  }
}
