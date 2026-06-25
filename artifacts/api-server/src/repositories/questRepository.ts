// ─────────────────────────────────────────────────────────────────────────────
// Quest Repository — HUB-12
// ─────────────────────────────────────────────────────────────────────────────

export type QuestType       = "MAIN" | "SIDE" | "DAILY" | "WEEKLY" | "EVENT";
export type QuestStatus     = "ACTIVE" | "INACTIVE" | "FINISHED";
export type QuestDifficulty = "EASY" | "NORMAL" | "HARD" | "LEGENDARY";
export type ObjectiveType   =
  | "LOGIN" | "OPEN_APP" | "BUY_ITEM" | "SELL_ITEM" | "CREATE_LISTING"
  | "TRANSFER_WALLET" | "GAIN_REPUTATION" | "ADD_FRIEND" | "JOIN_GUILD"
  | "CONTRIBUTE_GUILD" | "COLLECT_ITEM" | "OWN_ITEM" | "LEVEL_REPUTATION" | "CUSTOM";
export type UserQuestStatus = "IN_PROGRESS" | "COMPLETED" | "CLAIMED" | "CANCELLED";

export interface Quest {
  id:               string;
  title:            string;
  description:      string;
  type:             QuestType;
  status:           QuestStatus;
  difficulty:       QuestDifficulty;
  requiredLevel:    number;
  repeatable:       boolean;
  startAt:          string | null;
  endAt:            string | null;
  rewardCredits:    number;
  rewardCoins:      number;
  rewardTokens:     number;
  rewardReputation: number;
  metadata:         Record<string, unknown> | null;
  objectives:       QuestObjective[];
  createdAt:        string;
  updatedAt:        string;
}

export interface QuestObjective {
  id:          string;
  questId:     string;
  type:        ObjectiveType;
  description: string;
  targetCount: number;
  metadata:    Record<string, unknown> | null;
  orderIndex:  number;
}

export interface UserQuest {
  id:          string;
  userId:      string;
  questId:     string;
  status:      UserQuestStatus;
  startedAt:   string;
  completedAt: string | null;
  claimedAt:   string | null;
  progress:    UserQuestProgress[];
  createdAt:   string;
  updatedAt:   string;
}

export interface UserQuestProgress {
  id:           string;
  userQuestId:  string;
  objectiveId:  string;
  currentCount: number;
  completed:    boolean;
  updatedAt:    string;
}

export interface CreateQuestInput {
  title:            string;
  description:      string;
  type:             QuestType;
  difficulty:       QuestDifficulty;
  requiredLevel?:   number;
  repeatable?:      boolean;
  startAt?:         string | null;
  endAt?:           string | null;
  rewardCredits?:   number;
  rewardCoins?:     number;
  rewardTokens?:    number;
  rewardReputation?:number;
  metadata?:        Record<string, unknown>;
  objectives:       Omit<QuestObjective, "id" | "questId">[];
}

export interface IQuestRepository {
  // Quest CRUD
  findAll(filter?: { type?: QuestType; status?: QuestStatus }): Promise<Quest[]>;
  findById(id: string): Promise<Quest | null>;
  create(input: CreateQuestInput): Promise<Quest>;

  // User Quest
  findUserQuestsByUserId(userId: string): Promise<UserQuest[]>;
  findUserQuestsByUserIdAndStatus(userId: string, status: UserQuestStatus[]): Promise<UserQuest[]>;
  findUserQuestById(id: string): Promise<UserQuest | null>;
  findUserQuestByUserAndQuest(userId: string, questId: string): Promise<UserQuest | null>;
  createUserQuest(userId: string, questId: string): Promise<UserQuest>;
  updateUserQuestStatus(id: string, status: UserQuestStatus, extra?: { completedAt?: string; claimedAt?: string }): Promise<UserQuest | null>;

  // Progress
  incrementProgress(userQuestId: string, objectiveId: string, amount?: number): Promise<UserQuestProgress | null>;
  setProgressCompleted(userQuestId: string, objectiveId: string): Promise<UserQuestProgress | null>;
}
