// ─────────────────────────────────────────────────────────────────────────────
// ICharacterRepository — HUB-18
// ─────────────────────────────────────────────────────────────────────────────

export type CharacterClass = "WARRIOR" | "MAGE" | "ARCHER" | "ASSASSIN" | "ENGINEER" | "SUMMONER";
export type CharacterRace  = "HUMAN" | "ELF" | "DWARF" | "DEMON" | "ANGEL" | "BEAST";
export type EquipmentSlot  = "HEAD" | "CHEST" | "LEGS" | "BOOTS" | "GLOVES" | "WEAPON" | "OFFHAND" | "RING" | "NECKLACE" | "PET";
export type SkillType      = "ACTIVE" | "PASSIVE" | "ULTIMATE" | "TOGGLE";

export interface CharacterStats {
  hp: number; maxHp: number;
  mp: number; maxMp: number;
  stamina: number;
  attack: number; defense: number; speed: number;
  critRate: number; critDamage: number;
}

export interface CharacterAttributes {
  strength: number; agility: number; intelligence: number;
  vitality: number; wisdom: number; luck: number;
  freePoints: number;
}

export interface Character {
  id:         string;
  userId:     string;
  name:       string;
  class:      CharacterClass;
  race:       CharacterRace;
  faction:    string;
  title:      string | null;
  level:      number;
  experience: number;
  powerScore: number;
  isActive:   boolean;
  metadata:   Record<string, unknown> | null;
  createdAt:  string;
  updatedAt:  string;
}

export interface CharacterFull extends Character {
  stats:       CharacterStats;
  attributes:  CharacterAttributes;
  equipment:   EquippedItem[];
  skills:      LearnedSkill[];
  titles:      CharacterTitle[];
  customization: CharacterCustomization | null;
}

export interface EquippedItem {
  id:         string;
  characterId:string;
  slot:       EquipmentSlot;
  itemId:     string | null;
  itemName:   string | null;
  itemIcon:   string | null;
  itemRarity: string | null;
  statBonus:  Record<string, number> | null;
  equippedAt: string;
}

export interface SkillDefinition {
  id:          string;
  class:       CharacterClass;
  name:        string;
  description: string | null;
  icon:        string | null;
  maxLevel:    number;
  baseDamage:  number;
  baseCooldown:number;
  mpCost:      number;
  skillType:   SkillType;
  prerequisites: string[] | null;
}

export interface LearnedSkill {
  id:          string;
  characterId: string;
  skillId:     string;
  level:       number;
  isEquipped:  boolean;
  slotIndex:   number | null;
  skill?:      SkillDefinition;
}

export interface CharacterTitle {
  id:          string;
  characterId: string;
  titleKey:    string;
  titleName:   string;
  titleDesc:   string | null;
  isSelected:  boolean;
  unlockedAt:  string;
}

export interface CharacterPreset {
  id:          string;
  characterId: string;
  name:        string;
  equipment:   Record<string, unknown> | null;
  skills:      Record<string, unknown> | null;
  attributes:  Record<string, unknown> | null;
  isDefault:   boolean;
  createdAt:   string;
  updatedAt:   string;
}

export interface CharacterCustomization {
  id:          string;
  characterId: string;
  skinTone:    string;
  hairStyle:   string;
  hairColor:   string;
  eyeColor:    string;
  faceStyle:   string;
  bodyType:    string;
  accessories: Record<string, unknown> | null;
}

export interface ExperienceLog {
  id:          string;
  characterId: string;
  amount:      number;
  source:      string;
  sourceId:    string | null;
  totalAfter:  number;
  createdAt:   string;
}

export interface CreateCharacterInput {
  userId:    string;
  name:      string;
  class?:    CharacterClass;
  race?:     CharacterRace;
  faction?:  string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCharacterInput {
  name?:        string;
  title?:       string | null;
  faction?:     string;
  metadata?:    Record<string, unknown>;
}

export interface EquipItemInput {
  characterId: string;
  slot:        EquipmentSlot;
  itemId:      string;
  itemName:    string;
  itemIcon?:   string;
  itemRarity?: string;
  statBonus?:  Record<string, number>;
}

export interface LearnSkillInput {
  characterId: string;
  skillId:     string;
}

export interface ICharacterRepository {
  createCharacter(input: CreateCharacterInput): Promise<Character>;
  updateCharacter(id: string, input: UpdateCharacterInput): Promise<Character>;
  deleteCharacter(id: string): Promise<void>;
  getCharacter(id: string): Promise<Character | null>;
  getCharacterByUserId(userId: string): Promise<Character | null>;
  getCharacterFull(id: string): Promise<CharacterFull | null>;
  getStats(characterId: string): Promise<CharacterStats | null>;
  updateStats(characterId: string, stats: Partial<CharacterStats>): Promise<CharacterStats>;
  getAttributes(characterId: string): Promise<CharacterAttributes | null>;
  updateAttributes(characterId: string, attrs: Partial<CharacterAttributes>): Promise<CharacterAttributes>;
  gainExperience(characterId: string, amount: number, source: string, sourceId?: string): Promise<{ newTotal: number; leveled: boolean; newLevel: number }>;
  levelUp(characterId: string): Promise<{ newLevel: number; rewards: Record<string, unknown> }>;
  equipItem(input: EquipItemInput): Promise<EquippedItem>;
  unequipItem(characterId: string, slot: EquipmentSlot): Promise<void>;
  getEquipment(characterId: string): Promise<EquippedItem[]>;
  getSkillTree(class_: CharacterClass): Promise<SkillDefinition[]>;
  learnSkill(input: LearnSkillInput): Promise<LearnedSkill>;
  upgradeSkill(characterId: string, skillId: string): Promise<LearnedSkill>;
  getLearnedSkills(characterId: string): Promise<LearnedSkill[]>;
  getTitles(characterId: string): Promise<CharacterTitle[]>;
  unlockTitle(characterId: string, titleKey: string, titleName: string, titleDesc?: string): Promise<CharacterTitle>;
  selectTitle(characterId: string, titleKey: string): Promise<void>;
  savePreset(characterId: string, name: string): Promise<CharacterPreset>;
  loadPreset(characterId: string, presetId: string): Promise<CharacterPreset>;
  getPresets(characterId: string): Promise<CharacterPreset[]>;
  getCustomization(characterId: string): Promise<CharacterCustomization | null>;
  updateCustomization(characterId: string, data: Partial<Omit<CharacterCustomization, "id" | "characterId">>): Promise<CharacterCustomization>;
  getExperienceLogs(characterId: string, limit?: number): Promise<ExperienceLog[]>;
  updatePowerScore(characterId: string): Promise<number>;
  seedSkillTrees(): Promise<void>;
  seedLevelTable(): Promise<void>;
}
