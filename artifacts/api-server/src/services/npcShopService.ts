// ─────────────────────────────────────────────────────────────────────────────
// NPCShopService — HUB-17
// ─────────────────────────────────────────────────────────────────────────────

import type { ICraftingRepository, NpcShop } from "../repositories/craftingRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { craftingEventBus }              from "./craftingEventBus.js";
import { economyEventBus }               from "./economyEventBus.js";

export class ShopError extends Error {
  constructor(message: string, public code = "SHOP_ERROR", public status = 400) {
    super(message);
    this.name = "ShopError";
  }
}

const TODAY = () => new Date().toISOString().split("T")[0]!;

export class NPCShopService {
  constructor(
    private readonly repo:           ICraftingRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  async getShops(worldId?: string): Promise<NpcShop[]> {
    return this.repo.getNpcShops(worldId);
  }

  async getShop(id: string): Promise<NpcShop> {
    const s = await this.repo.getNpcShop(id);
    if (!s) throw new ShopError(`Cửa hàng không tồn tại: ${id}`, "SHOP_NOT_FOUND", 404);
    return s;
  }

  async buyItem(userId: string, shopId: string, itemId: string, quantity: number): Promise<{ cost: number; item: string }> {
    const shop = await this.getShop(shopId);
    const item = shop.items.find(i => i.id === itemId);
    if (!item) throw new ShopError("Vật phẩm không tồn tại trong cửa hàng", "ITEM_NOT_FOUND", 404);
    if (!item.isInfinite && item.stock < quantity) throw new ShopError(`Không đủ hàng. Còn lại: ${item.stock}`, "OUT_OF_STOCK");

    const cost = item.buyPrice * quantity;
    if (!item.isInfinite) await this.repo.deductShopStock(itemId, quantity);

    craftingEventBus.publish({ type: "NPC_PURCHASE", userId, shopId, itemId, quantity, cost });
    economyEventBus.publish({ type: "CREDITS_SPENT", userId, amount: cost, reason: `NPC mua: ${item.name}` });

    await this.repo.incrementStat(TODAY(), "totalNpcBuys", 1);
    await this.repo.incrementStat(TODAY(), "creditsSpent", cost);

    this.actService.fire({
      userId, type: "system" as any,
      title: `Mua ${quantity}x ${item.name} từ ${shop.name}`,
      description: `Chi phí: ${cost} Credits`,
      metadata: { shopId, itemId, quantity, cost },
    });

    this.reputationRepo.addEvent({ userId, eventType: "MARKETPLACE_PURCHASE" as any }).catch(() => {});

    return { cost, item: item.name };
  }

  async sellItem(userId: string, shopId: string, itemId: string, quantity: number): Promise<{ earned: number; item: string }> {
    const shop = await this.getShop(shopId);
    const item = shop.items.find(i => i.id === itemId);
    if (!item) throw new ShopError("Vật phẩm không tồn tại trong cửa hàng", "ITEM_NOT_FOUND", 404);

    const earned = item.sellPrice * quantity;
    await this.repo.addShopStock(itemId, quantity);

    craftingEventBus.publish({ type: "NPC_SALE", userId, shopId, itemId, quantity, earned });
    economyEventBus.publish({ type: "CREDITS_EARNED", userId, amount: earned, reason: `NPC bán: ${item.name}` });

    await this.repo.incrementStat(TODAY(), "totalNpcSells", 1);
    await this.repo.incrementStat(TODAY(), "creditsEarned", earned);

    this.actService.fire({
      userId, type: "system" as any,
      title: `Bán ${quantity}x ${item.name} cho ${shop.name}`,
      description: `Thu nhập: ${earned} Credits`,
      metadata: { shopId, itemId, quantity, earned },
    });

    return { earned, item: item.name };
  }
}
