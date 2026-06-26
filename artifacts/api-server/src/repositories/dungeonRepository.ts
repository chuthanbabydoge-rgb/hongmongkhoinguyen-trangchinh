// ─────────────────────────────────────────────────────────────────────────────
// IDungeonRepository + IRaidRepository — HUB-21
// ─────────────────────────────────────────────────────────────────────────────

export type DungeonDifficulty = "NORMAL" | "HARD" | "ELITE" | "LEGENDARY" | "MYTHIC";
export type DungeonStatus     = "WAITING" | "ACTIVE" | "COMPLETED" | "FAILED" | "EXPIRED";
export type RaidDifficulty    = "NORMAL" | "HEROIC" | "MYTHIC" | "NIGHTMARE";
export type RaidRole          = "TANK" | "HEALER" | "DPS" | "SUPPORT";

// ─── Dungeon domain types ─────────────────────────────────────────────────────

export interface Dungeon {
  id: string;
  name: string;
  description: string | null;
  difficulty: DungeonDifficulty;
  minLevel: number;
  maxPlayers: number;
  timeLimit: number;
  rewardCredits: number;
  rewardXp: number;
  icon: string | null;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DungeonInstance {
  id: string;
  dungeonId: string;
  leaderId: string;
  status: DungeonStatus;
  difficulty: DungeonDifficulty;
  currentRoom: number;
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  dungeon?: Dungeon;
  memberCount?: number;
}

export interface DungeonMember {
  id: string;
  instanceId: string;
  userId: string;
  hp: number;
  maxHp: number;
  isAlive: boolean;
  revives: number;
  joinedAt: string;
  leftAt: string | null;
}

export interface DungeonBoss {
  id: string;
  dungeonId: string;
  name: string;
  description: string | null;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  abilities: Record<string, unknown>[] | null;
  lootTable: Record<string, unknown>[] | null;
  icon: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DungeonMonster {
  id: string;
  roomId: string;
  dungeonId: string;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  xpReward: number;
  goldReward: number;
  icon: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DungeonReward {
  id: string;
  instanceId: string;
  userId: string;
  credits: number;
  xp: number;
  items: LootItem[] | null;
  claimedAt: string;
}

export interface LootItem {
  name: string;
  type: string;
  rarity: string;
  quantity: number;
  icon?: string;
}

export interface DungeonStatistics {
  id: string;
  userId: string;
  dungeonId: string;
  completions: number;
  failures: number;
  totalKills: number;
  totalDeaths: number;
  bestTime: number | null;
  totalXpEarned: number;
  updatedAt: string;
}

export interface CreateDungeonInstanceInput {
  dungeonId: string;
  leaderId: string;
  difficulty?: DungeonDifficulty;
}

export interface IDungeonRepository {
  // Dungeon definitions
  listDungeons(): Promise<Dungeon[]>;
  getDungeon(id: string): Promise<Dungeon | null>;

  // Instances
  createInstance(input: CreateDungeonInstanceInput): Promise<DungeonInstance>;
  getInstance(id: string): Promise<DungeonInstance | null>;
  listInstances(status?: DungeonStatus): Promise<DungeonInstance[]>;
  updateInstanceStatus(id: string, status: DungeonStatus, extra?: Partial<{ currentRoom: number; startedAt: Date; completedAt: Date }>): Promise<DungeonInstance>;

  // Members
  joinDungeon(instanceId: string, userId: string): Promise<DungeonMember>;
  leaveDungeon(instanceId: string, userId: string): Promise<void>;
  listMembers(instanceId: string): Promise<DungeonMember[]>;
  getMember(instanceId: string, userId: string): Promise<DungeonMember | null>;
  updateMemberHp(instanceId: string, userId: string, hp: number): Promise<void>;
  reviveMember(instanceId: string, userId: string): Promise<void>;

  // Boss / Monster
  getBoss(dungeonId: string): Promise<DungeonBoss | null>;
  spawnBoss(dungeonId: string): Promise<DungeonBoss | null>;
  spawnMonster(roomId: string, dungeonId: string): Promise<DungeonMonster>;
  recordKill(instanceId: string, userId: string, target: string): Promise<void>;

  // Rewards
  recordReward(instanceId: string, userId: string, credits: number, xp: number, items: LootItem[]): Promise<DungeonReward>;
  getRewards(instanceId: string): Promise<DungeonReward[]>;

  // History & Stats
  getHistory(userId: string, limit?: number): Promise<DungeonInstance[]>;
  getStatistics(userId: string): Promise<DungeonStatistics[]>;
  upsertStatistics(userId: string, dungeonId: string, patch: Partial<Omit<DungeonStatistics, "id" | "userId" | "dungeonId" | "updatedAt">>): Promise<void>;

  // Seeding
  seedDungeons(): Promise<void>;
  seedBosses(): Promise<void>;
}

// ─── Raid domain types ────────────────────────────────────────────────────────

export interface RaidBoss {
  id: string;
  name: string;
  description: string | null;
  difficulty: RaidDifficulty;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  phases: number;
  abilities: Record<string, unknown>[] | null;
  lootTable: Record<string, unknown>[] | null;
  icon: string | null;
  minPlayers: number;
  maxPlayers: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RaidGroup {
  id: string;
  name: string;
  leaderId: string;
  maxMembers: number;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaidMember {
  id: string;
  raidGroupId: string;
  userId: string;
  role: RaidRole;
  isReady: boolean;
  joinedAt: string;
  leftAt: string | null;
}

export interface RaidInstance {
  id: string;
  raidBossId: string;
  groupId: string | null;
  leaderId: string;
  status: DungeonStatus;
  difficulty: RaidDifficulty;
  currentPhase: number;
  bossHpRemaining: number;
  startedAt: string | null;
  completedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  boss?: RaidBoss;
}

export interface RaidDamageLog {
  id: string;
  instanceId: string;
  userId: string;
  target: string;
  damage: number;
  healing: number;
  skill: string | null;
  loggedAt: string;
}

export interface RaidRanking {
  id: string;
  userId: string;
  bossId: string;
  bestTime: number | null;
  totalDamage: number;
  totalHealing: number;
  role: RaidRole;
  kills: number;
  updatedAt: string;
}

export interface RaidHistoryEntry {
  id: string;
  userId: string;
  instanceId: string;
  bossId: string;
  result: string;
  role: RaidRole;
  damage: number;
  healing: number;
  kills: number;
  duration: number;
  completedAt: string;
}

export interface CreateRaidInput {
  raidBossId: string;
  leaderId: string;
  difficulty?: RaidDifficulty;
  groupId?: string;
}

export interface IRaidRepository {
  // Boss definitions
  listBosses(difficulty?: RaidDifficulty): Promise<RaidBoss[]>;
  getBoss(id: string): Promise<RaidBoss | null>;

  // Groups
  createGroup(name: string, leaderId: string, maxMembers?: number): Promise<RaidGroup>;
  getGroup(id: string): Promise<RaidGroup | null>;
  listGroups(): Promise<RaidGroup[]>;
  joinGroup(groupId: string, userId: string, role?: RaidRole): Promise<RaidMember>;
  leaveGroup(groupId: string, userId: string): Promise<void>;
  getGroupMembers(groupId: string): Promise<RaidMember[]>;

  // Instances
  createRaid(input: CreateRaidInput): Promise<RaidInstance>;
  getRaid(id: string): Promise<RaidInstance | null>;
  listRaids(status?: DungeonStatus): Promise<RaidInstance[]>;
  joinRaid(instanceId: string, userId: string, role?: RaidRole): Promise<void>;
  startRaid(instanceId: string): Promise<RaidInstance>;
  finishRaid(instanceId: string, success: boolean): Promise<RaidInstance>;

  // Combat
  recordDamage(instanceId: string, userId: string, damage: number, healing?: number, skill?: string): Promise<void>;
  updateBossHp(instanceId: string, hpRemaining: number): Promise<void>;
  advancePhase(instanceId: string): Promise<void>;

  // Rewards
  distributeRewards(instanceId: string, members: Array<{ userId: string; role: RaidRole; damage: number; healing: number }>): Promise<void>;
  getRewards(instanceId: string): Promise<Array<{ userId: string; credits: number; xp: number; items: LootItem[] }>>;

  // Rankings & History
  leaderboard(bossId: string, limit?: number): Promise<RaidRanking[]>;
  history(userId: string, limit?: number): Promise<RaidHistoryEntry[]>;
  upsertRanking(userId: string, bossId: string, role: RaidRole, damage: number, healing: number, bestTime?: number): Promise<void>;

  // Seeding
  seedBosses(): Promise<void>;
}
