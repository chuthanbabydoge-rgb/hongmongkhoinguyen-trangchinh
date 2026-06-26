// ─────────────────────────────────────────────────────────────────────────────
// IBossRepository + IWorldEventRepository — HUB-22
// ─────────────────────────────────────────────────────────────────────────────

export type BossType  = "WORLD" | "DUNGEON" | "RAID" | "SEASONAL" | "LEGENDARY";
export type BossState = "IDLE" | "SPAWNING" | "ACTIVE" | "ENRAGED" | "RETREAT" | "DEAD";
export type EventType = "INVASION" | "DEFENSE" | "ESCORT" | "TREASURE" | "WORLD_BOSS" | "SEASONAL";
export type WeatherType = "SUNNY" | "RAIN" | "SNOW" | "STORM" | "FOG" | "MAGIC";

// ─── Boss domain types ────────────────────────────────────────────────────────

export interface WorldBoss {
  id: string; name: string; description: string | null; type: BossType; state: BossState;
  level: number; hp: number; maxHp: number; attack: number; defense: number; speed: number;
  currentPhase: number; totalPhases: number; enrageThreshold: number; isEnraged: boolean;
  minPlayers: number; maxPlayers: number; rewardCredits: number; rewardXp: number;
  respawnSeconds: number; icon: string | null; region: string | null; lore: string | null;
  metadata: Record<string, unknown> | null;
  lastSpawnAt: string | null; nextSpawnAt: string | null; defeatedAt: string | null;
  createdAt: string; updatedAt: string;
  participantCount?: number;
}

export interface BossSkill {
  id: string; bossId: string; name: string; description: string | null;
  type: string; damage: number; healing: number; cooldownSec: number;
  aoeRadius: number; phase: number; isEnrageSkill: boolean; icon: string | null;
  metadata: Record<string, unknown> | null; createdAt: string;
}

export interface BossPhase {
  id: string; bossId: string; phase: number; name: string; description: string | null;
  hpThreshold: number; damageMulti: number; speedMulti: number;
  isEnragePhase: boolean; metadata: Record<string, unknown> | null; createdAt: string;
}

export interface BossParticipant {
  id: string; bossId: string; userId: string;
  totalDamage: number; totalHealing: number;
  joinedAt: string; leftAt: string | null; isAlive: boolean; hp: number; maxHp: number;
}

export interface BossDamageLog {
  id: string; bossId: string; userId: string; skillName: string | null;
  damage: number; healing: number; isCrit: boolean; bossHpAfter: number | null;
  phase: number; loggedAt: string;
}

export interface BossLootItem {
  name: string; type: string; rarity: string; quantity: number; icon?: string;
}

export interface BossRanking {
  id: string; bossId: string; userId: string;
  totalDamage: number; totalHealing: number; kills: number; rank: number | null;
  updatedAt: string;
}

export interface BossStatistics {
  id: string; userId: string; bossId: string;
  kills: number; totalDamage: number; totalHealing: number;
  bestDamage: number; participations: number; updatedAt: string;
}

export interface SkillCastResult {
  skill: BossSkill; damage: number; targets: string[]; isCrit: boolean;
}

export interface IBossRepository {
  // Boss definitions
  listBosses(type?: BossType): Promise<WorldBoss[]>;
  getActiveBosses(): Promise<WorldBoss[]>;
  getBoss(id: string): Promise<WorldBoss | null>;

  // Spawn / despawn
  spawnBoss(id: string): Promise<WorldBoss>;
  despawnBoss(id: string): Promise<WorldBoss>;

  // AI
  updateBossAI(bossId: string, state: Partial<{ currentTarget: string; lastSkillUsed: string; aiMode: string; threatTable: Record<string, number> }>): Promise<void>;
  castBossSkill(bossId: string, skillId: string, targetId: string): Promise<SkillCastResult>;
  changeBossPhase(bossId: string, phase: number): Promise<WorldBoss>;

  // Combat
  joinBoss(bossId: string, userId: string): Promise<BossParticipant>;
  getParticipants(bossId: string): Promise<BossParticipant[]>;
  recordDamage(bossId: string, userId: string, damage: number, healing?: number, skillName?: string, isCrit?: boolean): Promise<{ boss: WorldBoss; logId: string }>;
  dealDamageToBoss(bossId: string, damage: number): Promise<WorldBoss>;
  enrageBoss(bossId: string): Promise<WorldBoss>;
  defeatBoss(bossId: string): Promise<WorldBoss>;

  // Loot
  recordLoot(bossId: string, userId: string, credits: number, xp: number, items: BossLootItem[]): Promise<void>;
  getSkills(bossId: string, phase?: number): Promise<BossSkill[]>;

  // Leaderboard & stats
  leaderboard(bossId: string, limit?: number): Promise<BossRanking[]>;
  upsertRanking(bossId: string, userId: string, damage: number, healing: number): Promise<void>;
  upsertStatistics(userId: string, bossId: string, patch: Partial<Omit<BossStatistics, "id" | "userId" | "bossId" | "updatedAt">>): Promise<void>;
  getStatistics(userId: string): Promise<BossStatistics[]>;
  getHistory(userId: string, limit?: number): Promise<BossDamageLog[]>;

  // Seeding
  seedBosses(): Promise<void>;
  seedSkills(): Promise<void>;
  seedPhases(): Promise<void>;
}

// ─── World Event domain types ──────────────────────────────────────────────────

export interface WorldEvent {
  id: string; name: string; description: string | null; type: EventType; status: string;
  region: string | null; maxParticipants: number; rewardCredits: number; rewardXp: number;
  startsAt: string | null; endsAt: string | null; completedAt: string | null;
  icon: string | null; metadata: Record<string, unknown> | null;
  createdAt: string; updatedAt: string;
  objectives?: WorldEventObjective[];
  participantCount?: number;
}

export interface WorldEventObjective {
  id: string; eventId: string; name: string; description: string | null;
  target: number; current: number; isComplete: boolean; order: number;
  createdAt: string; updatedAt: string;
}

export interface WorldEventParticipant {
  id: string; eventId: string; userId: string;
  contribution: number; joinedAt: string; leftAt: string | null;
}

export interface WorldWeather {
  id: string; region: string; weather: WeatherType; intensity: number;
  description: string | null; endsAt: string | null;
  metadata: Record<string, unknown> | null; createdAt: string; updatedAt: string;
}

export interface IWorldEventRepository {
  // Events
  listEvents(status?: string): Promise<WorldEvent[]>;
  getEvent(id: string): Promise<WorldEvent | null>;
  createWorldEvent(data: Omit<WorldEvent, "id" | "createdAt" | "updatedAt" | "objectives" | "participantCount">): Promise<WorldEvent>;
  startWorldEvent(id: string): Promise<WorldEvent>;
  completeWorldEvent(id: string, success: boolean): Promise<WorldEvent>;

  // Participants
  joinWorldEvent(eventId: string, userId: string): Promise<WorldEventParticipant>;
  getParticipants(eventId: string): Promise<WorldEventParticipant[]>;

  // Objectives
  getObjectives(eventId: string): Promise<WorldEventObjective[]>;
  contributeObjective(objectiveId: string, userId: string, amount: number): Promise<WorldEventObjective>;

  // Rewards
  distributeRewards(eventId: string, participants: WorldEventParticipant[]): Promise<void>;
  getHistory(userId: string, limit?: number): Promise<WorldEvent[]>;

  // Weather
  getCurrentWeather(region?: string): Promise<WorldWeather | null>;
  setWeather(region: string, weather: WeatherType, intensity?: number, durationSec?: number): Promise<WorldWeather>;
  listWeather(): Promise<WorldWeather[]>;

  // Seeding
  seedEvents(): Promise<void>;
  seedWeather(): Promise<void>;
}
