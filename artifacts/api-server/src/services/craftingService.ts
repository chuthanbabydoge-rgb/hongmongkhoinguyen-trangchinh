// ─────────────────────────────────────────────────────────────────────────────
// CraftingService — HUB-17
// ─────────────────────────────────────────────────────────────────────────────

import type { ICraftingRepository, CraftingRecipe, UserCraftingJob, UserBlueprint, ItemUpgrade, ItemEnchantment, UpgradeType } from "../repositories/craftingRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { craftingEventBus }              from "./craftingEventBus.js";
import { economyEventBus }               from "./economyEventBus.js";

export class CraftingError extends Error {
  constructor(message: string, public code = "CRAFTING_ERROR", public status = 400) {
    super(message);
    this.name = "CraftingError";
  }
}

const TODAY = () => new Date().toISOString().split("T")[0]!;

export class CraftingService {
  constructor(
    private readonly repo:           ICraftingRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Recipes ───────────────────────────────────────────────────────────────

  async getRecipes(category?: string): Promise<CraftingRecipe[]> {
    return this.repo.getRecipes(category);
  }

  async getRecipe(id: string): Promise<CraftingRecipe> {
    const r = await this.repo.getRecipe(id);
    if (!r) throw new CraftingError(`Công thức không tồn tại: ${id}`, "RECIPE_NOT_FOUND", 404);
    return r;
  }

  // ── Craft Jobs ────────────────────────────────────────────────────────────

  async startCraft(userId: string, recipeId: string): Promise<UserCraftingJob> {
    const recipe = await this.getRecipe(recipeId);
    if (!recipe.isEnabled) throw new CraftingError("Công thức này đã bị vô hiệu hóa", "RECIPE_DISABLED");

    const finishesAt = new Date(Date.now() + recipe.craftingTime * 1000);
    const job = await this.repo.startCraft({ userId, recipeId }, finishesAt);

    craftingEventBus.publish({
      type: "CRAFT_STARTED", userId, jobId: job.id,
      recipeId, recipeName: recipe.name,
    });
    economyEventBus.publish({ type: "CREDITS_SPENT", userId, amount: recipe.craftingCost, reason: `Craft: ${recipe.name}` });
    await this.repo.incrementStat(TODAY(), "totalCrafted", 1);
    await this.repo.incrementStat(TODAY(), "creditsSpent", recipe.craftingCost);

    this.actService.fire({
      userId, type: "system" as any,
      title: `Bắt đầu chế tạo: ${recipe.name}`,
      description: `Thời gian hoàn thành: ${recipe.craftingTime}s`,
      metadata: { jobId: job.id, recipeId },
    });

    return job;
  }

  async completeCraft(userId: string, jobId: string): Promise<{ job: UserCraftingJob; outputs: Array<{ itemType?: string; resourceType?: string; quantity: number }> }> {
    const job = await this.repo.finishCraft(jobId);
    if (!job) throw new CraftingError("Không thể hoàn thành công việc này", "JOB_FINISH_FAILED");

    const recipe = await this.getRecipe(job.recipeId);
    const outputs: Array<{ itemType?: string; resourceType?: string; quantity: number }> = [];

    for (const out of recipe.outputs) {
      if (Math.random() * 100 <= out.chance) {
        outputs.push({ itemType: out.itemType ?? undefined, resourceType: out.resourceType ?? undefined, quantity: out.quantity });
      }
    }

    await this.repo.addHistory({
      userId, recipeId: recipe.id, jobId,
      success: true, outputItemId: outputs[0]?.itemType ?? null,
      creditsSpent: recipe.craftingCost, metadata: { outputs },
    });

    craftingEventBus.publish({
      type: "CRAFT_COMPLETED", userId, jobId,
      recipeId: recipe.id, recipeName: recipe.name,
      outputItemId: outputs[0]?.itemType,
    });

    this.notifService.fire(userId, "system" as any, "⚒️ Chế tạo hoàn thành!", `${recipe.name} đã sẵn sàng trong túi đồ của bạn.`);

    this.actService.fire({
      userId, type: "system" as any,
      title: `Hoàn thành chế tạo: ${recipe.name}`,
      description: `Nhận được ${outputs.length} loại vật phẩm`,
      metadata: { jobId, recipeId: recipe.id, outputs },
    });

    this.reputationRepo.addEvent({ userId, eventType: "INVENTORY_ACQUIRED" as any }).catch(() => {});

    return { job, outputs };
  }

  async cancelCraft(userId: string, jobId: string): Promise<UserCraftingJob> {
    const job = await this.repo.cancelCraft(jobId, userId);
    if (!job) throw new CraftingError("Không thể huỷ công việc này", "CANCEL_FAILED");
    craftingEventBus.publish({ type: "CRAFT_FAILED", userId, jobId, recipeId: job.recipeId, reason: "Người dùng huỷ" });
    return job;
  }

  async getJobs(userId: string, status?: string): Promise<UserCraftingJob[]> {
    return this.repo.getUserJobs(userId, status as any);
  }

  async getHistory(userId: string, limit = 20) {
    return this.repo.getHistory(userId, limit);
  }

  // ── Blueprints ────────────────────────────────────────────────────────────

  async getBlueprints(userId: string): Promise<UserBlueprint[]> {
    return this.repo.getBlueprints(userId);
  }

  async unlockBlueprint(userId: string, recipeId: string): Promise<UserBlueprint> {
    const recipe = await this.getRecipe(recipeId);
    const has = await this.repo.hasBlueprint(userId, recipeId);
    if (has) throw new CraftingError("Bạn đã mở khoá công thức này rồi", "BLUEPRINT_EXISTS");

    const bp = await this.repo.unlockBlueprint(userId, recipeId);
    craftingEventBus.publish({ type: "BLUEPRINT_UNLOCKED", userId, recipeId, recipeName: recipe.name });
    this.actService.fire({
      userId, type: "system" as any,
      title: `Mở khoá bản thiết kế: ${recipe.name}`,
      description: `Bạn có thể chế tạo ${recipe.name} bây giờ.`,
      metadata: { recipeId },
    });
    return bp;
  }

  // ── Upgrades / Enchants ───────────────────────────────────────────────────

  async upgradeItem(userId: string, itemId: string, upgradeType: UpgradeType, cost: number): Promise<ItemUpgrade> {
    const upgrade = await this.repo.upgradeItem({ itemId, userId, upgradeType, cost });
    craftingEventBus.publish({ type: "ITEM_UPGRADED", userId, itemId, upgradeType, level: upgrade.level });
    economyEventBus.publish({ type: "CREDITS_SPENT", userId, amount: cost, reason: `Nâng cấp vật phẩm: ${upgradeType}` });

    this.notifService.fire(userId, "system" as any, "⬆️ Nâng cấp thành công!", `Vật phẩm đã được nâng lên cấp ${upgrade.level}.`);
    this.actService.fire({
      userId, type: "system" as any,
      title: `Nâng cấp vật phẩm lên cấp ${upgrade.level}`,
      description: `Loại: ${upgradeType}`,
      metadata: { itemId, upgradeType, level: upgrade.level, cost },
    });
    this.reputationRepo.addEvent({ userId, eventType: "INVENTORY_ACQUIRED" as any }).catch(() => {});
    return upgrade;
  }

  async enchantItem(userId: string, itemId: string, enchantType: string, value: number, cost: number): Promise<ItemEnchantment> {
    const success = Math.random() > 0.2;
    if (!success) {
      this.notifService.fire(userId, "system" as any, "✨ Phù chú thất bại", "Lần này phù chú không thành công. Hãy thử lại!");
      throw new CraftingError("Phù chú thất bại! Hãy thử lại.", "ENCHANT_FAILED");
    }
    const enchant = await this.repo.enchantItem({ itemId, userId, enchantType, value });
    craftingEventBus.publish({ type: "ITEM_ENCHANTED", userId, itemId, enchantType, value });
    economyEventBus.publish({ type: "CREDITS_SPENT", userId, amount: cost, reason: `Phù chú: ${enchantType}` });

    this.notifService.fire(userId, "system" as any, "✨ Phù chú thành công!", `Vật phẩm đã được phù chú ${enchantType} +${value}.`);
    this.actService.fire({
      userId, type: "system" as any,
      title: `Phù chú vật phẩm: ${enchantType}`,
      description: `Giá trị: +${value}`,
      metadata: { itemId, enchantType, value, cost },
    });
    return enchant;
  }

  async getItemEnchantments(itemId: string) { return this.repo.getItemEnchantments(itemId); }
  async getItemUpgrades(itemId: string)     { return this.repo.getItemUpgrades(itemId); }
  async getStations(worldId?: string)       { return this.repo.getStations(worldId); }
}
