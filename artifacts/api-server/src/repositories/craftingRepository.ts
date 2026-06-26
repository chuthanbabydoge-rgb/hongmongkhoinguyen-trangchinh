// ─────────────────────────────────────────────────────────────────────────────
// ICraftingRepository — HUB-17
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ───────────────────────────────────────────────────────────────────

export type CraftJobStatus  = "PENDING" | "CRAFTING" | "FINISHED" | "FAILED" | "CANCELLED";
export type ResourceType    = "WOOD" | "STONE" | "IRON" | "GOLD" | "CRYSTAL" | "MAGIC" | "FOOD" | "HERB";
export type UpgradeType     = "LEVEL" | "RARITY" | "ENCHANT" | "SOCKET";

// ─── Domain models ───────────────────────────────────────────────────────────

export interface RecipeIngredient {
  id:           string;
  recipeId:     string;
  resourceType: ResourceType | null;
  itemType:     string | null;
  quantity:     number;
}

export interface RecipeOutput {
  id:           string;
  recipeId:     string;
  resourceType: ResourceType | null;
  itemType:     string | null;
  quantity:     number;
  chance:       number;
  isGuaranteed: boolean;
}

export interface CraftingRecipe {
  id:            string;
  name:          string;
  description:   string | null;
  category:      string;
  craftingTime:  number;
  craftingCost:  number;
  requiredLevel: number;
  stationId:     string | null;
  isEnabled:     boolean;
  metadata:      Record<string, unknown> | null;
  ingredients:   RecipeIngredient[];
  outputs:       RecipeOutput[];
  createdAt:     string;
  updatedAt:     string;
}

export interface UserCraftingJob {
  id:          string;
  userId:      string;
  recipeId:    string;
  status:      CraftJobStatus;
  startedAt:   string;
  finishesAt:  string;
  completedAt: string | null;
  metadata:    Record<string, unknown> | null;
}

export interface ResourceNode {
  id:            string;
  worldId:       string | null;
  name:          string;
  resourceType:  ResourceType;
  maxAmount:     number;
  currentAmount: number;
  respawnTime:   number;
  posX:          number;
  posY:          number;
  isActive:      boolean;
  metadata:      Record<string, unknown> | null;
  createdAt:     string;
  updatedAt:     string;
}

export interface ResourceGatherLog {
  id:         string;
  userId:     string;
  nodeId:     string;
  amount:     number;
  gatheredAt: string;
}

export interface NpcShop {
  id:          string;
  worldId:     string | null;
  name:        string;
  description: string | null;
  currency:    string;
  isActive:    boolean;
  metadata:    Record<string, unknown> | null;
  items:       NpcShopItem[];
  createdAt:   string;
  updatedAt:   string;
}

export interface NpcShopItem {
  id:           string;
  shopId:       string;
  name:         string;
  resourceType: ResourceType | null;
  itemType:     string | null;
  buyPrice:     number;
  sellPrice:    number;
  stock:        number;
  maxStock:     number;
  isInfinite:   boolean;
  metadata:     Record<string, unknown> | null;
}

export interface CraftingStation {
  id:            string;
  name:          string;
  stationType:   string;
  requiredLevel: number;
  isGuild:       boolean;
  guildId:       string | null;
  worldId:       string | null;
  isActive:      boolean;
  metadata:      Record<string, unknown> | null;
  createdAt:     string;
}

export interface UserBlueprint {
  id:         string;
  userId:     string;
  recipeId:   string;
  unlockedAt: string;
}

export interface ItemEnchantment {
  id:          string;
  itemId:      string;
  userId:      string;
  enchantType: string;
  value:       number;
  metadata:    Record<string, unknown> | null;
  enchantedAt: string;
}

export interface ItemUpgrade {
  id:          string;
  itemId:      string;
  userId:      string;
  upgradeType: UpgradeType;
  level:       number;
  cost:        number;
  metadata:    Record<string, unknown> | null;
  upgradedAt:  string;
}

export interface EconomyStatistics {
  id:            string;
  date:          string;
  totalCrafted:  number;
  totalGathered: number;
  totalTraded:   number;
  totalNpcBuys:  number;
  totalNpcSells: number;
  creditsSpent:  number;
  creditsEarned: number;
  metadata:      Record<string, unknown> | null;
  updatedAt:     string;
}

export interface ResourceMarketPrice {
  id:           string;
  resourceType: ResourceType;
  price:        number;
  change:       number;
  updatedAt:    string;
}

export interface CraftingHistoryEntry {
  id:           string;
  userId:       string;
  recipeId:     string;
  jobId:        string | null;
  success:      boolean;
  outputItemId: string | null;
  creditsSpent: number;
  metadata:     Record<string, unknown> | null;
  createdAt:    string;
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreateRecipeInput {
  name:          string;
  description?:  string;
  category?:     string;
  craftingTime?: number;
  craftingCost?: number;
  requiredLevel?: number;
  stationId?:    string;
  ingredients:   Omit<RecipeIngredient, "id" | "recipeId">[];
  outputs:       Omit<RecipeOutput, "id" | "recipeId">[];
}

export interface StartCraftInput {
  userId:   string;
  recipeId: string;
}

export interface GatherInput {
  userId: string;
  nodeId: string;
  amount: number;
}

export interface UpgradeItemInput {
  itemId:      string;
  userId:      string;
  upgradeType: UpgradeType;
  cost:        number;
}

export interface EnchantItemInput {
  itemId:      string;
  userId:      string;
  enchantType: string;
  value:       number;
}

export interface BuyNpcItemInput {
  userId:   string;
  shopId:   string;
  itemId:   string;
  quantity: number;
}

export interface SellNpcItemInput {
  userId:   string;
  shopId:   string;
  itemId:   string;
  quantity: number;
}

// ─── Repository interface ────────────────────────────────────────────────────

export interface ICraftingRepository {
  // Recipes
  getRecipes(category?: string): Promise<CraftingRecipe[]>;
  getRecipe(id: string): Promise<CraftingRecipe | null>;
  createRecipe(input: CreateRecipeInput): Promise<CraftingRecipe>;

  // Crafting jobs
  startCraft(input: StartCraftInput, finishesAt: Date): Promise<UserCraftingJob>;
  finishCraft(jobId: string): Promise<UserCraftingJob | null>;
  cancelCraft(jobId: string, userId: string): Promise<UserCraftingJob | null>;
  getUserJobs(userId: string, status?: CraftJobStatus): Promise<UserCraftingJob[]>;

  // Resources
  getResources(worldId?: string): Promise<ResourceNode[]>;
  getResource(id: string): Promise<ResourceNode | null>;
  spawnResource(nodeId: string, amount: number): Promise<void>;
  gather(input: GatherInput): Promise<ResourceGatherLog>;
  updateNodeAmount(nodeId: string, delta: number): Promise<void>;
  seedDefaultNodes(): Promise<void>;

  // Item upgrades / enchants
  upgradeItem(input: UpgradeItemInput): Promise<ItemUpgrade>;
  enchantItem(input: EnchantItemInput): Promise<ItemEnchantment>;
  getItemEnchantments(itemId: string): Promise<ItemEnchantment[]>;
  getItemUpgrades(itemId: string): Promise<ItemUpgrade[]>;

  // Blueprints
  getBlueprints(userId: string): Promise<UserBlueprint[]>;
  hasBlueprint(userId: string, recipeId: string): Promise<boolean>;
  unlockBlueprint(userId: string, recipeId: string): Promise<UserBlueprint>;

  // NPC Shops
  getNpcShops(worldId?: string): Promise<NpcShop[]>;
  getNpcShop(id: string): Promise<NpcShop | null>;
  deductShopStock(itemId: string, quantity: number): Promise<void>;
  addShopStock(itemId: string, quantity: number): Promise<void>;
  seedDefaultShops(): Promise<void>;

  // Economy
  getEconomyStats(date?: string): Promise<EconomyStatistics | null>;
  incrementStat(date: string, field: keyof Omit<EconomyStatistics, "id"|"date"|"metadata"|"updatedAt">, delta: number): Promise<void>;
  getMarketPrices(): Promise<ResourceMarketPrice[]>;
  getMarketPrice(resourceType: ResourceType): Promise<ResourceMarketPrice | null>;
  updateMarketPrice(resourceType: ResourceType, price: number, change: number): Promise<ResourceMarketPrice>;
  seedMarketPrices(): Promise<void>;

  // History
  addHistory(entry: Omit<CraftingHistoryEntry, "id" | "createdAt">): Promise<CraftingHistoryEntry>;
  getHistory(userId: string, limit?: number): Promise<CraftingHistoryEntry[]>;

  // Stations
  getStations(worldId?: string): Promise<CraftingStation[]>;
  seedDefaultStations(): Promise<void>;
  seedDefaultRecipes(): Promise<void>;
}
