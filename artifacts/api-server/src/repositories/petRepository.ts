// ─────────────────────────────────────────────────────────────────────────────
// IPetRepository + IMountRepository — HUB-20
// ─────────────────────────────────────────────────────────────────────────────

export type PetRarity  = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
export type PetType    = "BEAST" | "DRAGON" | "SPIRIT" | "MECHANICAL" | "ELEMENTAL" | "CELESTIAL";
export type MountType  = "HORSE" | "WOLF" | "DRAGON" | "PHOENIX" | "TIGER" | "MECH";
export type MountStatus= "ACTIVE" | "RESTING" | "TRAINING" | "TRAVELING";

// ─── Pet domain types ─────────────────────────────────────────────────────────

export interface PetSpecies {
  id: string; name: string; description: string | null;
  type: PetType; rarity: PetRarity;
  icon: string | null; maxLevel: number;
  evolutionLevel: number | null; evolutionInto: string | null;
  baseHp: number; baseAttack: number; baseDefense: number; baseSpeed: number;
  baseHappiness: number;
  bondBonus: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Pet {
  id: string; userId: string; speciesId: string;
  name: string; nickname: string | null;
  type: PetType; rarity: PetRarity;
  level: number; experience: number;
  happiness: number; hunger: number; loyalty: number;
  hp: number; maxHp: number; attack: number; defense: number; speed: number;
  isSummoned: boolean; isActive: boolean;
  evolutionStage: number;
  lastFedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string; updatedAt: string;
}

export interface PetSkill {
  id: string; name: string; description: string | null;
  icon: string | null; type: string;
  baseDamage: number; baseHealing: number;
  cooldown: number; energyCost: number;
  petType: PetType | null; minLevel: number;
  metadata: Record<string, unknown> | null;
}

export interface PetLearnedSkill {
  id: string; petId: string; skillId: string;
  level: number; isEquipped: boolean;
  learnedAt: string;
  skill?: PetSkill;
}

export interface PetEquipment {
  id: string; petId: string; slot: string;
  itemId: string | null; itemName: string | null;
  itemIcon: string | null; itemRarity: string | null;
  statBonus: Record<string, number> | null;
  equippedAt: string; updatedAt: string;
}

export interface PetTrainingRecord {
  id: string; petId: string; userId: string;
  trainingType: string; xpGained: number;
  statImproved: string | null; statGain: number;
  cost: number; duration: number;
  completedAt: string | null; createdAt: string;
}

export interface PetEvolutionRecord {
  id: string; petId: string; userId: string;
  fromStage: number; toStage: number;
  fromSpeciesId: string | null; toSpeciesId: string | null;
  statsBefore: Record<string, unknown> | null;
  statsAfter: Record<string, unknown> | null;
  evolvedAt: string;
}

export interface PetBond {
  id: string; petId: string; userId: string;
  bondLevel: number; bondPoints: number;
  bonusType: string | null; bonusValue: number | null;
  lastInteract: string | null; updatedAt: string;
}

export interface PetLog {
  id: string; petId: string; userId: string;
  action: string; detail: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreatePetInput {
  userId: string; speciesId: string; name: string;
  nickname?: string; type?: PetType; rarity?: PetRarity;
}

export interface IPetRepository {
  // Species
  listSpecies(): Promise<PetSpecies[]>;
  getSpecies(id: string): Promise<PetSpecies | null>;
  seedSpecies(): Promise<void>;

  // Pet CRUD
  createPet(input: CreatePetInput): Promise<Pet>;
  deletePet(petId: string): Promise<void>;
  getPet(petId: string): Promise<Pet | null>;
  listPets(userId: string): Promise<Pet[]>;
  updatePet(petId: string, data: Partial<Pet>): Promise<Pet>;

  // Actions
  feedPet(petId: string, hungerRestore: number, happinessBoost: number): Promise<Pet>;
  trainPet(petId: string, userId: string, trainingType: string): Promise<{ pet: Pet; training: PetTrainingRecord }>;
  levelPet(petId: string): Promise<Pet>;
  evolvePet(petId: string, userId: string): Promise<{ pet: Pet; evolution: PetEvolutionRecord }>;
  equipPet(petId: string, slot: string, itemId: string, itemName: string, itemIcon?: string, itemRarity?: string, statBonus?: Record<string, number>): Promise<PetEquipment>;
  unequipPet(petId: string, slot: string): Promise<void>;
  learnPetSkill(petId: string, skillId: string): Promise<PetLearnedSkill>;
  summonPet(petId: string, userId: string): Promise<Pet>;
  dismissPet(petId: string, userId: string): Promise<Pet>;
  getSummonedPet(userId: string): Promise<Pet | null>;

  // Skills
  listSkills(petType?: PetType): Promise<PetSkill[]>;
  getLearnedSkills(petId: string): Promise<PetLearnedSkill[]>;
  getEquipment(petId: string): Promise<PetEquipment[]>;

  // Bond
  getBond(petId: string, userId: string): Promise<PetBond | null>;
  updateBond(petId: string, userId: string, points: number): Promise<PetBond>;

  // Logs
  getLogs(petId: string, limit?: number): Promise<PetLog[]>;
  addLog(petId: string, userId: string, action: string, detail?: string, metadata?: Record<string, unknown>): Promise<void>;

  // Gain XP
  gainXp(petId: string, amount: number): Promise<{ pet: Pet; leveled: boolean; newLevel: number }>;

  // Seed
  seedLevelTable(): Promise<void>;
  seedSkills(): Promise<void>;
  seedRoutes(): Promise<void>;
}

// ─── Mount domain types ───────────────────────────────────────────────────────

export interface MountTypeRecord {
  id: string; name: string; type: MountType;
  description: string | null; icon: string | null;
  rarity: PetRarity; baseSpeed: number; baseStamina: number;
  maxLevel: number; travelBonus: number;
  metadata: Record<string, unknown> | null; createdAt: string;
}

export interface Mount {
  id: string; userId: string; typeId: string;
  name: string; type: MountType; rarity: PetRarity;
  status: MountStatus;
  level: number; experience: number;
  speed: number; stamina: number; maxStamina: number;
  isActive: boolean;
  color: string | null; pattern: string | null;
  accessories: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string; updatedAt: string;
}

export interface MountEquipmentRecord {
  id: string; mountId: string; slot: string;
  itemId: string | null; itemName: string | null;
  itemIcon: string | null; itemRarity: string | null;
  statBonus: Record<string, number> | null;
  equippedAt: string; updatedAt: string;
}

export interface MountTrainingRecord {
  id: string; mountId: string; userId: string;
  trainingType: string; xpGained: number;
  statImproved: string | null; statGain: number;
  cost: number; duration: number;
  completedAt: string | null; createdAt: string;
}

export interface MountRoute {
  id: string; name: string; description: string | null;
  origin: string; destination: string;
  distance: number; baseDuration: number;
  xpReward: number; isActive: boolean;
  metadata: Record<string, unknown> | null; createdAt: string;
}

export interface MountTravelLog {
  id: string; mountId: string; userId: string;
  routeId: string | null; origin: string; destination: string;
  distance: number; duration: number;
  xpGained: number; staminaUsed: number;
  startedAt: string; arrivedAt: string | null;
  status: string;
  metadata: Record<string, unknown> | null; createdAt: string;
}

export interface MountStatistics {
  id: string; userId: string;
  totalMounts: number; totalTravels: number;
  totalDistance: number; totalXpEarned: number;
  fastestTravel: number | null; favoriteMount: string | null;
  updatedAt: string;
}

export interface MountCustomization {
  id: string; mountId: string;
  color: string; pattern: string;
  saddle: string; armor: string;
  accessories: Record<string, unknown> | null;
  glowEffect: string | null; trailEffect: string | null;
  updatedAt: string;
}

export interface CreateMountInput {
  userId: string; typeId: string; name: string;
  type?: MountType; rarity?: PetRarity;
}

export interface IMountRepository {
  // Types
  listMountTypes(): Promise<MountTypeRecord[]>;
  seedMountTypes(): Promise<void>;

  // Mount CRUD
  createMount(input: CreateMountInput): Promise<Mount>;
  getMount(mountId: string): Promise<Mount | null>;
  listMounts(userId: string): Promise<Mount[]>;
  updateMount(mountId: string, data: Partial<Mount>): Promise<Mount>;
  getActiveMount(userId: string): Promise<Mount | null>;

  // Actions
  levelMount(mountId: string): Promise<Mount>;
  trainMount(mountId: string, userId: string, trainingType: string): Promise<{ mount: Mount; training: MountTrainingRecord }>;
  equipMount(mountId: string, slot: string, itemId: string, itemName: string, itemIcon?: string, itemRarity?: string, statBonus?: Record<string, number>): Promise<MountEquipmentRecord>;
  unequipMount(mountId: string, slot: string): Promise<void>;
  getEquipment(mountId: string): Promise<MountEquipmentRecord[]>;
  travel(mountId: string, userId: string, routeId: string): Promise<MountTravelLog>;
  arriveTravel(travelLogId: string): Promise<MountTravelLog>;

  // Routes
  listRoutes(): Promise<MountRoute[]>;
  getRoute(routeId: string): Promise<MountRoute | null>;

  // Gain XP
  gainXp(mountId: string, amount: number): Promise<{ mount: Mount; leveled: boolean; newLevel: number }>;

  // Stats
  getStatistics(userId: string): Promise<MountStatistics>;
  updateStatistics(userId: string, delta: Partial<MountStatistics>): Promise<void>;

  // Customization
  getCustomization(mountId: string): Promise<MountCustomization | null>;
  updateCustomization(mountId: string, data: Partial<MountCustomization>): Promise<MountCustomization>;

  // Travel logs
  getTravelLogs(userId: string, limit?: number): Promise<MountTravelLog[]>;

  // Skills
  learnSkill(mountId: string, skillId: string): Promise<void>;
  getLearnedSkills(mountId: string): Promise<unknown[]>;

  // Seed
  seedLevelTable(): Promise<void>;
  seedRoutes(): Promise<void>;
}
