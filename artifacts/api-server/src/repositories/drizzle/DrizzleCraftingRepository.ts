import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  craftingRecipes, recipeIngredients, recipeOutputs,
  userCraftingJobs, resourceNodes, resourceSpawns,
  resourceGatherLogs, npcShops, npcShopItems,
  craftingStations, userBlueprints, itemEnchantments,
  itemUpgrades, economyStatistics, resourceMarketPrices,
  craftingHistory,
} from "@workspace/db/schema";
import type {
  ICraftingRepository,
  CraftingRecipe, RecipeIngredient, RecipeOutput,
  UserCraftingJob, ResourceNode, ResourceGatherLog,
  NpcShop, NpcShopItem, CraftingStation, UserBlueprint,
  ItemEnchantment, ItemUpgrade, EconomyStatistics,
  ResourceMarketPrice, CraftingHistoryEntry,
  CreateRecipeInput, StartCraftInput, GatherInput,
  UpgradeItemInput, EnchantItemInput,
  CraftJobStatus, ResourceType, UpgradeType,
} from "../craftingRepository.js";

// ─── Mappers ─────────────────────────────────────────────────────────────────

function toJob(r: typeof userCraftingJobs.$inferSelect): UserCraftingJob {
  return {
    id:          r.id,
    userId:      r.userId,
    recipeId:    r.recipeId,
    status:      r.status as CraftJobStatus,
    startedAt:   r.startedAt.toISOString(),
    finishesAt:  r.finishesAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
    metadata:    r.metadata as Record<string, unknown> | null,
  };
}

function toNode(r: typeof resourceNodes.$inferSelect): ResourceNode {
  return {
    id:            r.id,
    worldId:       r.worldId,
    name:          r.name,
    resourceType:  r.resourceType as ResourceType,
    maxAmount:     r.maxAmount,
    currentAmount: r.currentAmount,
    respawnTime:   r.respawnTime,
    posX:          r.posX,
    posY:          r.posY,
    isActive:      r.isActive,
    metadata:      r.metadata as Record<string, unknown> | null,
    createdAt:     r.createdAt.toISOString(),
    updatedAt:     r.updatedAt.toISOString(),
  };
}

function toShopItem(r: typeof npcShopItems.$inferSelect): NpcShopItem {
  return {
    id:           r.id,
    shopId:       r.shopId,
    name:         r.name,
    resourceType: r.resourceType as ResourceType | null,
    itemType:     r.itemType,
    buyPrice:     r.buyPrice,
    sellPrice:    r.sellPrice,
    stock:        r.stock,
    maxStock:     r.maxStock,
    isInfinite:   r.isInfinite,
    metadata:     r.metadata as Record<string, unknown> | null,
  };
}

function toStation(r: typeof craftingStations.$inferSelect): CraftingStation {
  return {
    id:            r.id,
    name:          r.name,
    stationType:   r.stationType,
    requiredLevel: r.requiredLevel,
    isGuild:       r.isGuild,
    guildId:       r.guildId,
    worldId:       r.worldId,
    isActive:      r.isActive,
    metadata:      r.metadata as Record<string, unknown> | null,
    createdAt:     r.createdAt.toISOString(),
  };
}

function toBlueprint(r: typeof userBlueprints.$inferSelect): UserBlueprint {
  return { id: r.id, userId: r.userId, recipeId: r.recipeId, unlockedAt: r.unlockedAt.toISOString() };
}

function toEnchantment(r: typeof itemEnchantments.$inferSelect): ItemEnchantment {
  return {
    id: r.id, itemId: r.itemId, userId: r.userId,
    enchantType: r.enchantType, value: r.value,
    metadata: r.metadata as Record<string, unknown> | null,
    enchantedAt: r.enchantedAt.toISOString(),
  };
}

function toUpgrade(r: typeof itemUpgrades.$inferSelect): ItemUpgrade {
  return {
    id: r.id, itemId: r.itemId, userId: r.userId,
    upgradeType: r.upgradeType as UpgradeType,
    level: r.level, cost: r.cost,
    metadata: r.metadata as Record<string, unknown> | null,
    upgradedAt: r.upgradedAt.toISOString(),
  };
}

function toMarketPrice(r: typeof resourceMarketPrices.$inferSelect): ResourceMarketPrice {
  return {
    id: r.id, resourceType: r.resourceType as ResourceType,
    price: r.price, change: r.change, updatedAt: r.updatedAt.toISOString(),
  };
}

function toEconStats(r: typeof economyStatistics.$inferSelect): EconomyStatistics {
  return {
    id: r.id, date: r.date,
    totalCrafted:  r.totalCrafted,
    totalGathered: r.totalGathered,
    totalTraded:   r.totalTraded,
    totalNpcBuys:  r.totalNpcBuys,
    totalNpcSells: r.totalNpcSells,
    creditsSpent:  r.creditsSpent,
    creditsEarned: r.creditsEarned,
    metadata:      r.metadata as Record<string, unknown> | null,
    updatedAt:     r.updatedAt.toISOString(),
  };
}

function toHistoryEntry(r: typeof craftingHistory.$inferSelect): CraftingHistoryEntry {
  return {
    id: r.id, userId: r.userId, recipeId: r.recipeId, jobId: r.jobId,
    success: r.success, outputItemId: r.outputItemId,
    creditsSpent: r.creditsSpent,
    metadata: r.metadata as Record<string, unknown> | null,
    createdAt: r.createdAt.toISOString(),
  };
}

async function loadRecipe(row: typeof craftingRecipes.$inferSelect): Promise<CraftingRecipe> {
  const [ings, outs] = await Promise.all([
    db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, row.id)),
    db.select().from(recipeOutputs).where(eq(recipeOutputs.recipeId, row.id)),
  ]);
  return {
    id:            row.id,
    name:          row.name,
    description:   row.description,
    category:      row.category,
    craftingTime:  row.craftingTime,
    craftingCost:  row.craftingCost,
    requiredLevel: row.requiredLevel,
    stationId:     row.stationId,
    isEnabled:     row.isEnabled,
    metadata:      row.metadata as Record<string, unknown> | null,
    createdAt:     row.createdAt.toISOString(),
    updatedAt:     row.updatedAt.toISOString(),
    ingredients:   ings.map((i): RecipeIngredient => ({
      id: i.id, recipeId: i.recipeId,
      resourceType: i.resourceType as ResourceType | null,
      itemType: i.itemType, quantity: i.quantity,
    })),
    outputs:       outs.map((o): RecipeOutput => ({
      id: o.id, recipeId: o.recipeId,
      resourceType: o.resourceType as ResourceType | null,
      itemType: o.itemType, quantity: o.quantity,
      chance: o.chance, isGuaranteed: o.isGuaranteed,
    })),
  };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class DrizzleCraftingRepository implements ICraftingRepository {

  // ── Recipes ───────────────────────────────────────────────────────────────

  async getRecipes(category?: string): Promise<CraftingRecipe[]> {
    const rows = category
      ? await db.select().from(craftingRecipes).where(and(eq(craftingRecipes.isEnabled, true), eq(craftingRecipes.category, category))).orderBy(craftingRecipes.name)
      : await db.select().from(craftingRecipes).where(eq(craftingRecipes.isEnabled, true)).orderBy(craftingRecipes.name);
    return Promise.all(rows.map(loadRecipe));
  }

  async getRecipe(id: string): Promise<CraftingRecipe | null> {
    const rows = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, id));
    return rows[0] ? loadRecipe(rows[0]) : null;
  }

  async createRecipe(input: CreateRecipeInput): Promise<CraftingRecipe> {
    const [row] = await db.insert(craftingRecipes).values({
      name:          input.name,
      description:   input.description,
      category:      input.category ?? "GENERAL",
      craftingTime:  input.craftingTime ?? 60,
      craftingCost:  input.craftingCost ?? 0,
      requiredLevel: input.requiredLevel ?? 1,
      stationId:     input.stationId,
    }).returning();
    if (input.ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        input.ingredients.map(i => ({ recipeId: row!.id, ...i, resourceType: i.resourceType as any }))
      );
    }
    if (input.outputs.length > 0) {
      await db.insert(recipeOutputs).values(
        input.outputs.map(o => ({ recipeId: row!.id, ...o, resourceType: o.resourceType as any }))
      );
    }
    return loadRecipe(row!);
  }

  // ── Crafting Jobs ─────────────────────────────────────────────────────────

  async startCraft(input: StartCraftInput, finishesAt: Date): Promise<UserCraftingJob> {
    const [row] = await db.insert(userCraftingJobs).values({
      userId:     input.userId,
      recipeId:   input.recipeId,
      status:     "CRAFTING",
      finishesAt,
    }).returning();
    return toJob(row!);
  }

  async finishCraft(jobId: string): Promise<UserCraftingJob | null> {
    const [row] = await db.update(userCraftingJobs).set({
      status:      "FINISHED",
      completedAt: new Date(),
    }).where(and(eq(userCraftingJobs.id, jobId), eq(userCraftingJobs.status, "CRAFTING"))).returning();
    return row ? toJob(row) : null;
  }

  async cancelCraft(jobId: string, userId: string): Promise<UserCraftingJob | null> {
    const [row] = await db.update(userCraftingJobs).set({ status: "CANCELLED" })
      .where(and(eq(userCraftingJobs.id, jobId), eq(userCraftingJobs.userId, userId))).returning();
    return row ? toJob(row) : null;
  }

  async getUserJobs(userId: string, status?: CraftJobStatus): Promise<UserCraftingJob[]> {
    const rows = status
      ? await db.select().from(userCraftingJobs).where(and(eq(userCraftingJobs.userId, userId), eq(userCraftingJobs.status, status))).orderBy(desc(userCraftingJobs.startedAt))
      : await db.select().from(userCraftingJobs).where(eq(userCraftingJobs.userId, userId)).orderBy(desc(userCraftingJobs.startedAt));
    return rows.map(toJob);
  }

  // ── Resources ─────────────────────────────────────────────────────────────

  async getResources(worldId?: string): Promise<ResourceNode[]> {
    const rows = worldId
      ? await db.select().from(resourceNodes).where(and(eq(resourceNodes.isActive, true), eq(resourceNodes.worldId, worldId)))
      : await db.select().from(resourceNodes).where(eq(resourceNodes.isActive, true));
    return rows.map(toNode);
  }

  async getResource(id: string): Promise<ResourceNode | null> {
    const rows = await db.select().from(resourceNodes).where(eq(resourceNodes.id, id));
    return rows[0] ? toNode(rows[0]) : null;
  }

  async spawnResource(nodeId: string, amount: number): Promise<void> {
    await db.insert(resourceSpawns).values({ nodeId, amount, expiresAt: new Date(Date.now() + 3600_000) });
    await db.update(resourceNodes).set({
      currentAmount: sql`LEAST(${resourceNodes.maxAmount}, ${resourceNodes.currentAmount} + ${amount})`,
      updatedAt:     new Date(),
    }).where(eq(resourceNodes.id, nodeId));
  }

  async gather(input: GatherInput): Promise<ResourceGatherLog> {
    const [row] = await db.insert(resourceGatherLogs).values({
      userId: input.userId, nodeId: input.nodeId, amount: input.amount,
    }).returning();
    await this.updateNodeAmount(input.nodeId, -input.amount);
    return { id: row!.id, userId: row!.userId, nodeId: row!.nodeId, amount: row!.amount, gatheredAt: row!.gatheredAt.toISOString() };
  }

  async updateNodeAmount(nodeId: string, delta: number): Promise<void> {
    await db.update(resourceNodes).set({
      currentAmount: sql`GREATEST(0, ${resourceNodes.currentAmount} + ${delta})`,
      updatedAt:     new Date(),
    }).where(eq(resourceNodes.id, nodeId));
  }

  async seedDefaultNodes(): Promise<void> {
    const NODES: Array<{ name: string; resourceType: ResourceType; maxAmount: number; respawnTime: number; posX: number; posY: number }> = [
      { name: "Rừng cây gỗ",     resourceType: "WOOD",    maxAmount: 200, respawnTime: 120, posX: 10, posY: 20 },
      { name: "Mỏ đá granite",   resourceType: "STONE",   maxAmount: 150, respawnTime: 180, posX: 30, posY: 15 },
      { name: "Mỏ sắt núi cao",  resourceType: "IRON",    maxAmount: 100, respawnTime: 300, posX: 50, posY: 40 },
      { name: "Mỏ vàng huyền bí",resourceType: "GOLD",    maxAmount: 50,  respawnTime: 600, posX: 70, posY: 60 },
      { name: "Hang tinh thể",   resourceType: "CRYSTAL", maxAmount: 30,  respawnTime: 900, posX: 80, posY: 80 },
      { name: "Rừng phép thuật", resourceType: "MAGIC",   maxAmount: 40,  respawnTime: 450, posX: 20, posY: 70 },
      { name: "Đồng cỏ thực phẩm",resourceType:"FOOD",   maxAmount: 180, respawnTime: 90,  posX: 40, posY: 30 },
      { name: "Vườn thảo mộc",   resourceType: "HERB",    maxAmount: 120, respawnTime: 150, posX: 60, posY: 50 },
    ];
    for (const n of NODES) {
      const existing = await db.select().from(resourceNodes).where(and(eq(resourceNodes.name, n.name))).limit(1);
      if (!existing[0]) {
        await db.insert(resourceNodes).values({ ...n, currentAmount: n.maxAmount });
      }
    }
  }

  // ── Upgrades / Enchants ───────────────────────────────────────────────────

  async upgradeItem(input: UpgradeItemInput): Promise<ItemUpgrade> {
    const existing = await db.select().from(itemUpgrades)
      .where(and(eq(itemUpgrades.itemId, input.itemId), eq(itemUpgrades.upgradeType, input.upgradeType)))
      .orderBy(desc(itemUpgrades.upgradedAt)).limit(1);
    const currentLevel = existing[0]?.level ?? 0;
    const [row] = await db.insert(itemUpgrades).values({
      itemId: input.itemId, userId: input.userId,
      upgradeType: input.upgradeType as any,
      level: currentLevel + 1, cost: input.cost,
    }).returning();
    return toUpgrade(row!);
  }

  async enchantItem(input: EnchantItemInput): Promise<ItemEnchantment> {
    const [row] = await db.insert(itemEnchantments).values({
      itemId: input.itemId, userId: input.userId,
      enchantType: input.enchantType, value: input.value,
    }).returning();
    return toEnchantment(row!);
  }

  async getItemEnchantments(itemId: string): Promise<ItemEnchantment[]> {
    const rows = await db.select().from(itemEnchantments).where(eq(itemEnchantments.itemId, itemId)).orderBy(desc(itemEnchantments.enchantedAt));
    return rows.map(toEnchantment);
  }

  async getItemUpgrades(itemId: string): Promise<ItemUpgrade[]> {
    const rows = await db.select().from(itemUpgrades).where(eq(itemUpgrades.itemId, itemId)).orderBy(desc(itemUpgrades.upgradedAt));
    return rows.map(toUpgrade);
  }

  // ── Blueprints ────────────────────────────────────────────────────────────

  async getBlueprints(userId: string): Promise<UserBlueprint[]> {
    const rows = await db.select().from(userBlueprints).where(eq(userBlueprints.userId, userId)).orderBy(desc(userBlueprints.unlockedAt));
    return rows.map(toBlueprint);
  }

  async hasBlueprint(userId: string, recipeId: string): Promise<boolean> {
    const rows = await db.select().from(userBlueprints).where(and(eq(userBlueprints.userId, userId), eq(userBlueprints.recipeId, recipeId))).limit(1);
    return rows.length > 0;
  }

  async unlockBlueprint(userId: string, recipeId: string): Promise<UserBlueprint> {
    const [row] = await db.insert(userBlueprints).values({ userId, recipeId })
      .onConflictDoNothing().returning();
    if (row) return toBlueprint(row);
    const existing = await db.select().from(userBlueprints).where(and(eq(userBlueprints.userId, userId), eq(userBlueprints.recipeId, recipeId))).limit(1);
    return toBlueprint(existing[0]!);
  }

  // ── NPC Shops ─────────────────────────────────────────────────────────────

  async getNpcShops(worldId?: string): Promise<NpcShop[]> {
    const shopRows = worldId
      ? await db.select().from(npcShops).where(and(eq(npcShops.isActive, true), eq(npcShops.worldId, worldId)))
      : await db.select().from(npcShops).where(eq(npcShops.isActive, true));
    return Promise.all(shopRows.map(async (s) => {
      const items = await db.select().from(npcShopItems).where(eq(npcShopItems.shopId, s.id));
      return {
        id: s.id, worldId: s.worldId, name: s.name, description: s.description,
        currency: s.currency, isActive: s.isActive,
        metadata: s.metadata as Record<string, unknown> | null,
        createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString(),
        items: items.map(toShopItem),
      } satisfies NpcShop;
    }));
  }

  async getNpcShop(id: string): Promise<NpcShop | null> {
    const rows = await db.select().from(npcShops).where(eq(npcShops.id, id));
    if (!rows[0]) return null;
    const items = await db.select().from(npcShopItems).where(eq(npcShopItems.shopId, id));
    const s = rows[0];
    return {
      id: s.id, worldId: s.worldId, name: s.name, description: s.description,
      currency: s.currency, isActive: s.isActive,
      metadata: s.metadata as Record<string, unknown> | null,
      createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString(),
      items: items.map(toShopItem),
    };
  }

  async deductShopStock(itemId: string, quantity: number): Promise<void> {
    await db.update(npcShopItems).set({
      stock: sql`GREATEST(0, ${npcShopItems.stock} - ${quantity})`,
    }).where(and(eq(npcShopItems.id, itemId), eq(npcShopItems.isInfinite, false)));
  }

  async addShopStock(itemId: string, quantity: number): Promise<void> {
    await db.update(npcShopItems).set({
      stock: sql`${npcShopItems.stock} + ${quantity}`,
    }).where(eq(npcShopItems.id, itemId));
  }

  async seedDefaultShops(): Promise<void> {
    const existing = await db.select().from(npcShops).limit(1);
    if (existing.length > 0) return;

    const [shop] = await db.insert(npcShops).values({
      name: "Cửa hàng Vật liệu", description: "Mua bán vật liệu cơ bản", currency: "CREDITS",
    }).returning();
    await db.insert(npcShopItems).values([
      { shopId: shop!.id, name: "Gỗ",      resourceType: "WOOD"   as any, buyPrice: 10,  sellPrice: 5,  isInfinite: true },
      { shopId: shop!.id, name: "Đá",      resourceType: "STONE"  as any, buyPrice: 8,   sellPrice: 4,  isInfinite: true },
      { shopId: shop!.id, name: "Sắt",     resourceType: "IRON"   as any, buyPrice: 25,  sellPrice: 12, isInfinite: true },
      { shopId: shop!.id, name: "Vàng",    resourceType: "GOLD"   as any, buyPrice: 100, sellPrice: 50, isInfinite: false, stock: 20, maxStock: 20 },
      { shopId: shop!.id, name: "Thảo mộc",resourceType: "HERB"   as any, buyPrice: 15,  sellPrice: 7,  isInfinite: true },
      { shopId: shop!.id, name: "Thực phẩm",resourceType:"FOOD"   as any, buyPrice: 5,   sellPrice: 2,  isInfinite: true },
    ]);
  }

  // ── Economy ───────────────────────────────────────────────────────────────

  async getEconomyStats(date?: string): Promise<EconomyStatistics | null> {
    const d = date ?? new Date().toISOString().split("T")[0]!;
    const rows = await db.select().from(economyStatistics).where(eq(economyStatistics.date, d));
    return rows[0] ? toEconStats(rows[0]) : null;
  }

  async incrementStat(date: string, field: keyof Omit<EconomyStatistics, "id"|"date"|"metadata"|"updatedAt">, delta: number): Promise<void> {
    const col = economyStatistics[field as keyof typeof economyStatistics] as any;
    await db.insert(economyStatistics).values({ date, [field]: delta })
      .onConflictDoUpdate({ target: economyStatistics.date, set: { [field]: sql`${col} + ${delta}`, updatedAt: new Date() } });
  }

  async getMarketPrices(): Promise<ResourceMarketPrice[]> {
    const rows = await db.select().from(resourceMarketPrices).orderBy(resourceMarketPrices.resourceType);
    return rows.map(toMarketPrice);
  }

  async getMarketPrice(resourceType: ResourceType): Promise<ResourceMarketPrice | null> {
    const rows = await db.select().from(resourceMarketPrices).where(eq(resourceMarketPrices.resourceType, resourceType));
    return rows[0] ? toMarketPrice(rows[0]) : null;
  }

  async updateMarketPrice(resourceType: ResourceType, price: number, change: number): Promise<ResourceMarketPrice> {
    const [row] = await db.insert(resourceMarketPrices).values({ resourceType: resourceType as any, price, change })
      .onConflictDoUpdate({ target: resourceMarketPrices.resourceType, set: { price, change, updatedAt: new Date() } })
      .returning();
    return toMarketPrice(row!);
  }

  async seedMarketPrices(): Promise<void> {
    const DEFAULTS: Array<[ResourceType, number]> = [
      ["WOOD", 10], ["STONE", 8], ["IRON", 25], ["GOLD", 100],
      ["CRYSTAL", 200], ["MAGIC", 150], ["FOOD", 5], ["HERB", 15],
    ];
    for (const [rt, price] of DEFAULTS) {
      await db.insert(resourceMarketPrices).values({ resourceType: rt as any, price, change: 0 })
        .onConflictDoNothing();
    }
  }

  // ── History ───────────────────────────────────────────────────────────────

  async addHistory(entry: Omit<CraftingHistoryEntry, "id" | "createdAt">): Promise<CraftingHistoryEntry> {
    const [row] = await db.insert(craftingHistory).values({
      userId: entry.userId, recipeId: entry.recipeId, jobId: entry.jobId,
      success: entry.success, outputItemId: entry.outputItemId,
      creditsSpent: entry.creditsSpent, metadata: entry.metadata,
    }).returning();
    return toHistoryEntry(row!);
  }

  async getHistory(userId: string, limit = 20): Promise<CraftingHistoryEntry[]> {
    const rows = await db.select().from(craftingHistory)
      .where(eq(craftingHistory.userId, userId))
      .orderBy(desc(craftingHistory.createdAt))
      .limit(limit);
    return rows.map(toHistoryEntry);
  }

  // ── Stations ──────────────────────────────────────────────────────────────

  async getStations(worldId?: string): Promise<CraftingStation[]> {
    const rows = worldId
      ? await db.select().from(craftingStations).where(and(eq(craftingStations.isActive, true), eq(craftingStations.worldId, worldId)))
      : await db.select().from(craftingStations).where(eq(craftingStations.isActive, true));
    return rows.map(toStation);
  }

  async seedDefaultStations(): Promise<void> {
    const existing = await db.select().from(craftingStations).limit(1);
    if (existing.length > 0) return;
    await db.insert(craftingStations).values([
      { name: "Lò rèn cơ bản",    stationType: "BLACKSMITH", requiredLevel: 1 },
      { name: "Bàn chế tạo gỗ",   stationType: "WOODWORKING", requiredLevel: 1 },
      { name: "Bếp nấu ăn",       stationType: "COOKING",    requiredLevel: 1 },
      { name: "Lò giả kim",        stationType: "ALCHEMY",    requiredLevel: 5 },
      { name: "Lò rèn phép thuật", stationType: "ENCHANTING", requiredLevel: 10, isGuild: false },
    ]);
  }

  async seedDefaultRecipes(): Promise<void> {
    const existing = await db.select().from(craftingRecipes).limit(1);
    if (existing.length > 0) return;
    const RECIPES: CreateRecipeInput[] = [
      {
        name: "Thanh sắt", category: "METAL", craftingTime: 30, craftingCost: 5, requiredLevel: 1,
        ingredients: [{ resourceType: "IRON", itemType: null, quantity: 2 }, { resourceType: "STONE", itemType: null, quantity: 1 }],
        outputs:     [{ resourceType: "IRON", itemType: "IRON_BAR", quantity: 1, chance: 100, isGuaranteed: true }],
      },
      {
        name: "Ván gỗ", category: "WOOD", craftingTime: 20, craftingCost: 3, requiredLevel: 1,
        ingredients: [{ resourceType: "WOOD", itemType: null, quantity: 3 }],
        outputs:     [{ resourceType: null,   itemType: "WOODEN_PLANK", quantity: 2, chance: 100, isGuaranteed: true }],
      },
      {
        name: "Bùa phép cơ bản", category: "MAGIC", craftingTime: 60, craftingCost: 20, requiredLevel: 3,
        ingredients: [{ resourceType: "MAGIC", itemType: null, quantity: 1 }, { resourceType: "CRYSTAL", itemType: null, quantity: 1 }],
        outputs:     [{ resourceType: null, itemType: "MAGIC_CHARM", quantity: 1, chance: 80, isGuaranteed: false },
                      { resourceType: null, itemType: "RARE_MAGIC_CHARM", quantity: 1, chance: 20, isGuaranteed: false }],
      },
      {
        name: "Bánh mì thảo mộc", category: "FOOD", craftingTime: 15, craftingCost: 2, requiredLevel: 1,
        ingredients: [{ resourceType: "FOOD", itemType: null, quantity: 2 }, { resourceType: "HERB", itemType: null, quantity: 1 }],
        outputs:     [{ resourceType: null, itemType: "HERB_BREAD", quantity: 3, chance: 100, isGuaranteed: true }],
      },
      {
        name: "Nhẫn vàng", category: "JEWELRY", craftingTime: 120, craftingCost: 50, requiredLevel: 5,
        ingredients: [{ resourceType: "GOLD", itemType: null, quantity: 2 }, { resourceType: "CRYSTAL", itemType: null, quantity: 1 }],
        outputs:     [{ resourceType: null, itemType: "GOLD_RING", quantity: 1, chance: 100, isGuaranteed: true }],
      },
    ];
    for (const r of RECIPES) await this.createRecipe(r);
  }
}
