// ─────────────────────────────────────────────────────────────────────────────
// ICombatRepository — HUB-19
// ─────────────────────────────────────────────────────────────────────────────

export type BattleType   = "PVE" | "PVP" | "ARENA" | "BOSS" | "DUNGEON" | "RAID" | "TRAINING";
export type BattleStatus = "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
export type ParticipantStatus = "ALIVE" | "DEAD" | "DISCONNECTED";
export type SkillTarget  = "SELF" | "ALLY" | "ENEMY" | "AREA";

export interface Battle {
  id:          string;
  type:        BattleType;
  status:      BattleStatus;
  creatorId:   string;
  winnerId:    string | null;
  currentTurn: number;
  maxTurns:    number;
  isRealtime:  boolean;
  bossId:      string | null;
  metadata:    Record<string, unknown> | null;
  startedAt:   string | null;
  finishedAt:  string | null;
  createdAt:   string;
  updatedAt:   string;
}

export interface Participant {
  id:           string;
  battleId:     string;
  userId:       string;
  characterId:  string | null;
  team:         number;
  status:       ParticipantStatus;
  currentHp:    number;
  maxHp:        number;
  currentMp:    number;
  maxMp:        number;
  attack:       number;
  defense:      number;
  speed:        number;
  critRate:     number;
  critDamage:   number;
  aggro:        number;
  comboCount:   number;
  isNpc:        boolean;
  npcName:      string | null;
  joinedAt:     string;
}

export interface CombatTurn {
  id:             string;
  battleId:       string;
  turnNumber:     number;
  actorId:        string;
  targetId:       string | null;
  actionType:     string;
  skillId:        string | null;
  damage:         number | null;
  healing:        number | null;
  isCritical:     boolean;
  isMiss:         boolean;
  isDodge:        boolean;
  isBlocked:      boolean;
  effectsApplied: unknown[] | null;
  metadata:       Record<string, unknown> | null;
  createdAt:      string;
}

export interface CombatSkill {
  id:          string;
  name:        string;
  description: string | null;
  icon:        string | null;
  target:      SkillTarget;
  mpCost:      number;
  cooldown:    number;
  baseDamage:  number;
  baseHealing: number;
  effectType:  string | null;
  effectValue: number | null;
  effectTurns: number | null;
  comboMultiplier: number;
}

export interface CombatEffect {
  id:            string;
  battleId:      string;
  participantId: string;
  effectType:    string;
  value:         number;
  turnsLeft:     number;
  sourceId:      string | null;
  createdAt:     string;
}

export interface DamageLog {
  id:            string;
  battleId:      string;
  turnId:        string | null;
  sourceId:      string;
  targetId:      string;
  damage:        number;
  damageType:    string;
  isCritical:    boolean;
  isMiss:        boolean;
  isDodge:       boolean;
  shieldAbsorbed:number;
  netDamage:     number;
  createdAt:     string;
}

export interface CombatReward {
  id:        string;
  battleId:  string;
  userId:    string;
  xp:        number;
  gold:      number;
  items:     unknown[] | null;
  reputation:number;
  isVictory: boolean;
  createdAt: string;
}

export interface CombatHistoryEntry {
  id:           string;
  battleId:     string;
  userId:       string;
  type:         BattleType;
  result:       string;
  opponentName: string | null;
  turnsCount:   number;
  xpGained:     number;
  goldGained:   number;
  createdAt:    string;
}

export interface Boss {
  id:          string;
  name:        string;
  description: string | null;
  icon:        string | null;
  level:       number;
  hp:          number;
  attack:      number;
  defense:     number;
  speed:       number;
  skills:      unknown[] | null;
  lootTable:   unknown[] | null;
  xpReward:    number;
  goldReward:  number;
  isWorldBoss: boolean;
  isActive:    boolean;
  createdAt:   string;
}

export interface ArenaRank {
  id:        string;
  userId:    string;
  season:    number;
  rating:    number;
  wins:      number;
  losses:    number;
  draws:     number;
  winStreak: number;
  rank:      string;
  updatedAt: string;
}

export interface CombatStatistics {
  id:               string;
  userId:           string;
  totalBattles:     number;
  totalWins:        number;
  totalLosses:      number;
  totalKills:       number;
  totalDamage:      number;
  totalHealing:     number;
  criticalHits:     number;
  bossesDefeated:   number;
  arenaWins:        number;
  longestWinStreak: number;
  favoriteSkill:    string | null;
  updatedAt:        string;
}

export interface BattleFull extends Battle {
  participants: Participant[];
  turns:        CombatTurn[];
  effects:      CombatEffect[];
}

export interface CreateBattleInput {
  type:       BattleType;
  creatorId:  string;
  isRealtime?: boolean;
  bossId?:    string;
  dungeonId?: string;
  metadata?:  Record<string, unknown>;
}

export interface AttackResult {
  turn:      CombatTurn;
  damageLog: DamageLog;
  targetDied: boolean;
  battleFinished: boolean;
  winnerId?: string;
  isCritical: boolean;
  isMiss: boolean;
  isDodge: boolean;
}

export interface SkillResult extends AttackResult {
  healingDone: number;
  effectsApplied: string[];
}

export interface ICombatRepository {
  createBattle(input: CreateBattleInput): Promise<Battle>;
  getBattle(id: string): Promise<Battle | null>;
  getBattleFull(id: string): Promise<BattleFull | null>;
  joinBattle(battleId: string, userId: string, characterId?: string, team?: number): Promise<Participant>;
  leaveBattle(battleId: string, userId: string): Promise<void>;
  startBattle(battleId: string): Promise<Battle>;
  finishBattle(battleId: string, winnerId?: string): Promise<Battle>;
  attack(battleId: string, actorId: string, targetId: string): Promise<AttackResult>;
  castSkill(battleId: string, actorId: string, targetId: string, skillId: string): Promise<SkillResult>;
  applyEffect(battleId: string, participantId: string, effectType: string, value: number, turns: number, sourceId?: string): Promise<CombatEffect>;
  removeEffect(effectId: string): Promise<void>;
  tickEffects(battleId: string): Promise<{ damaged: Record<string, number>; expired: string[] }>;
  recordDamage(battleId: string, turnId: string | null, sourceId: string, targetId: string, damage: number, options?: { damageType?: string; isCritical?: boolean; isMiss?: boolean; isDodge?: boolean; shieldAbsorbed?: number }): Promise<DamageLog>;
  recordReward(battleId: string, userId: string, xp: number, gold: number, reputation?: number, isVictory?: boolean, items?: unknown[]): Promise<CombatReward>;
  history(userId: string, limit?: number, offset?: number): Promise<CombatHistoryEntry[]>;
  leaderboard(season?: number, limit?: number): Promise<(ArenaRank & { username?: string })[]>;
  getArenaRank(userId: string, season?: number): Promise<ArenaRank | null>;
  updateArenaRank(userId: string, isWin: boolean, season?: number): Promise<ArenaRank>;
  getStatistics(userId: string): Promise<CombatStatistics | null>;
  updateStatistics(userId: string, delta: Partial<Omit<CombatStatistics, "id" | "userId" | "updatedAt">>): Promise<CombatStatistics>;
  listBattles(status?: BattleStatus, type?: BattleType, limit?: number): Promise<Battle[]>;
  listBosses(active?: boolean): Promise<Boss[]>;
  getBoss(id: string): Promise<Boss | null>;
  seedBosses(): Promise<void>;
  seedArena(): Promise<void>;
  seedSkills(): Promise<CombatSkill[]>;
  getSkills(): Promise<CombatSkill[]>;
  getParticipant(battleId: string, userId: string): Promise<Participant | null>;
  getParticipantById(participantId: string): Promise<Participant | null>;
  updateParticipantHp(participantId: string, newHp: number): Promise<Participant>;
  updateParticipantMp(participantId: string, newMp: number): Promise<Participant>;
  listBattlesByUser(userId: string, limit?: number): Promise<Battle[]>;
}
