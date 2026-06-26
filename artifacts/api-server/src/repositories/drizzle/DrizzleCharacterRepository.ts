// ─────────────────────────────────────────────────────────────────────────────
// DrizzleCharacterRepository — HUB-18
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  characters, characterStats, characterAttributes,
  characterEquipment, characterSkills, skillTrees,
  characterTitles, characterPresets, characterCustomization,
  characterExperienceLogs, characterLevels, characterLevelRewards,
} from "@workspace/db";
import type {
  ICharacterRepository, Character, CharacterFull, CharacterStats, CharacterAttributes,
  EquippedItem, SkillDefinition, LearnedSkill, CharacterTitle, CharacterPreset,
  CharacterCustomization, ExperienceLog, CreateCharacterInput, UpdateCharacterInput,
  EquipItemInput, LearnSkillInput, CharacterClass,
} from "../characterRepository.js";

const XP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(level, 1.5));

function toCharacter(row: typeof characters.$inferSelect): Character {
  return {
    id: row.id, userId: row.userId, name: row.name,
    class: row.class as Character["class"], race: row.race as Character["race"],
    faction: row.faction as string, title: row.title,
    level: row.level, experience: row.experience, powerScore: row.powerScore,
    isActive: row.isActive,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toStats(row: typeof characterStats.$inferSelect): CharacterStats {
  return {
    hp: row.hp, maxHp: row.maxHp, mp: row.mp, maxMp: row.maxMp,
    stamina: row.stamina, attack: row.attack, defense: row.defense,
    speed: row.speed, critRate: Number(row.critRate), critDamage: Number(row.critDamage),
  };
}

function toAttributes(row: typeof characterAttributes.$inferSelect): CharacterAttributes {
  return {
    strength: row.strength, agility: row.agility, intelligence: row.intelligence,
    vitality: row.vitality, wisdom: row.wisdom, luck: row.luck, freePoints: row.freePoints,
  };
}

function toEquipped(row: typeof characterEquipment.$inferSelect): EquippedItem {
  return {
    id: row.id, characterId: row.characterId,
    slot: row.slot as EquippedItem["slot"],
    itemId: row.itemId, itemName: row.itemName, itemIcon: row.itemIcon,
    itemRarity: row.itemRarity,
    statBonus: row.statBonus as Record<string, number> | null,
    equippedAt: row.equippedAt.toISOString(),
  };
}

function toSkillDef(row: typeof skillTrees.$inferSelect): SkillDefinition {
  return {
    id: row.id, class: row.class as CharacterClass,
    name: row.name, description: row.description, icon: row.icon,
    maxLevel: row.maxLevel, baseDamage: row.baseDamage, baseCooldown: row.baseCooldown,
    mpCost: row.mpCost, skillType: row.skillType as SkillDefinition["skillType"],
    prerequisites: row.prerequisites as string[] | null,
  };
}

function toLearnedSkill(row: typeof characterSkills.$inferSelect): LearnedSkill {
  return {
    id: row.id, characterId: row.characterId, skillId: row.skillId,
    level: row.level, isEquipped: row.isEquipped, slotIndex: row.slotIndex,
  };
}

function toTitle(row: typeof characterTitles.$inferSelect): CharacterTitle {
  return {
    id: row.id, characterId: row.characterId, titleKey: row.titleKey,
    titleName: row.titleName, titleDesc: row.titleDesc,
    isSelected: row.isSelected, unlockedAt: row.unlockedAt.toISOString(),
  };
}

function toPreset(row: typeof characterPresets.$inferSelect): CharacterPreset {
  return {
    id: row.id, characterId: row.characterId, name: row.name,
    equipment: row.equipment as Record<string, unknown> | null,
    skills: row.skills as Record<string, unknown> | null,
    attributes: row.attributes as Record<string, unknown> | null,
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toCustomization(row: typeof characterCustomization.$inferSelect): CharacterCustomization {
  return {
    id: row.id, characterId: row.characterId,
    skinTone: row.skinTone, hairStyle: row.hairStyle, hairColor: row.hairColor,
    eyeColor: row.eyeColor, faceStyle: row.faceStyle, bodyType: row.bodyType,
    accessories: row.accessories as Record<string, unknown> | null,
  };
}

function toXpLog(row: typeof characterExperienceLogs.$inferSelect): ExperienceLog {
  return {
    id: row.id, characterId: row.characterId, amount: row.amount,
    source: row.source, sourceId: row.sourceId, totalAfter: row.totalAfter,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DrizzleCharacterRepository implements ICharacterRepository {

  // ── Create / Update / Delete ───────────────────────────────────────────────

  async createCharacter(input: CreateCharacterInput): Promise<Character> {
    const [char] = await db.insert(characters).values({
      userId:   input.userId,
      name:     input.name,
      class:    (input.class  ?? "WARRIOR") as typeof characters.$inferInsert["class"],
      race:     (input.race   ?? "HUMAN")   as typeof characters.$inferInsert["race"],
      faction:  (input.faction ?? "NEUTRAL") as typeof characters.$inferInsert["faction"],
      metadata: input.metadata ?? null,
    }).returning();

    // Seed stats, attributes, customization
    await db.insert(characterStats).values({ characterId: char!.id }).onConflictDoNothing();
    await db.insert(characterAttributes).values({ characterId: char!.id }).onConflictDoNothing();
    await db.insert(characterCustomization).values({ characterId: char!.id }).onConflictDoNothing();

    return toCharacter(char!);
  }

  async updateCharacter(id: string, input: UpdateCharacterInput): Promise<Character> {
    const [char] = await db.update(characters).set({
      ...(input.name      !== undefined && { name: input.name }),
      ...(input.title     !== undefined && { title: input.title }),
      ...(input.faction   !== undefined && { faction: input.faction as typeof characters.$inferInsert["faction"] }),
      ...(input.metadata  !== undefined && { metadata: input.metadata }),
      updatedAt: new Date(),
    }).where(eq(characters.id, id)).returning();
    if (!char) throw new Error(`Character không tồn tại: ${id}`);
    return toCharacter(char);
  }

  async deleteCharacter(id: string): Promise<void> {
    await db.update(characters).set({ isActive: false, updatedAt: new Date() }).where(eq(characters.id, id));
  }

  async getCharacter(id: string): Promise<Character | null> {
    const [row] = await db.select().from(characters).where(and(eq(characters.id, id), eq(characters.isActive, true)));
    return row ? toCharacter(row) : null;
  }

  async getCharacterByUserId(userId: string): Promise<Character | null> {
    const [row] = await db.select().from(characters)
      .where(and(eq(characters.userId, userId), eq(characters.isActive, true)));
    return row ? toCharacter(row) : null;
  }

  async getCharacterFull(id: string): Promise<CharacterFull | null> {
    const char = await this.getCharacter(id);
    if (!char) return null;
    const [stats, attrs, equipment, skills, titles, customization] = await Promise.all([
      this.getStats(id),
      this.getAttributes(id),
      this.getEquipment(id),
      this.getLearnedSkillsWithDef(id),
      this.getTitles(id),
      this.getCustomization(id),
    ]);
    return {
      ...char,
      stats:         stats ?? { hp:100, maxHp:100, mp:50, maxMp:50, stamina:100, attack:10, defense:5, speed:10, critRate:0.05, critDamage:1.5 },
      attributes:    attrs ?? { strength:10, agility:10, intelligence:10, vitality:10, wisdom:10, luck:10, freePoints:0 },
      equipment,
      skills,
      titles,
      customization,
    };
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  async getStats(characterId: string): Promise<CharacterStats | null> {
    const [row] = await db.select().from(characterStats).where(eq(characterStats.characterId, characterId));
    return row ? toStats(row) : null;
  }

  async updateStats(characterId: string, stats: Partial<CharacterStats>): Promise<CharacterStats> {
    await db.insert(characterStats).values({ characterId, ...stats }).onConflictDoNothing();
    const [row] = await db.update(characterStats).set({ ...stats, updatedAt: new Date() })
      .where(eq(characterStats.characterId, characterId)).returning();
    return toStats(row!);
  }

  // ── Attributes ─────────────────────────────────────────────────────────────

  async getAttributes(characterId: string): Promise<CharacterAttributes | null> {
    const [row] = await db.select().from(characterAttributes).where(eq(characterAttributes.characterId, characterId));
    return row ? toAttributes(row) : null;
  }

  async updateAttributes(characterId: string, attrs: Partial<CharacterAttributes>): Promise<CharacterAttributes> {
    await db.insert(characterAttributes).values({ characterId, ...attrs }).onConflictDoNothing();
    const [row] = await db.update(characterAttributes).set({ ...attrs, updatedAt: new Date() })
      .where(eq(characterAttributes.characterId, characterId)).returning();
    return toAttributes(row!);
  }

  // ── Experience & Level ─────────────────────────────────────────────────────

  async gainExperience(characterId: string, amount: number, source: string, sourceId?: string): Promise<{ newTotal: number; leveled: boolean; newLevel: number }> {
    const char = await this.getCharacter(characterId);
    if (!char) throw new Error("Character không tồn tại");

    const newTotal = char.experience + amount;
    const xpForNextLevel = XP_PER_LEVEL(char.level + 1);
    const leveled = newTotal >= xpForNextLevel;

    await db.update(characters).set({
      experience: newTotal,
      updatedAt: new Date(),
      ...(leveled && { level: char.level + 1 }),
    }).where(eq(characters.id, characterId));

    await db.insert(characterExperienceLogs).values({
      characterId, amount, source, sourceId: sourceId ?? null, totalAfter: newTotal,
    });

    return { newTotal, leveled, newLevel: leveled ? char.level + 1 : char.level };
  }

  async levelUp(characterId: string): Promise<{ newLevel: number; rewards: Record<string, unknown> }> {
    const char = await this.getCharacter(characterId);
    if (!char) throw new Error("Character không tồn tại");

    const newLevel = char.level + 1;
    await db.update(characters).set({ level: newLevel, updatedAt: new Date() }).where(eq(characters.id, characterId));

    // Grant stat points
    const attrs = await this.getAttributes(characterId);
    if (attrs) {
      await this.updateAttributes(characterId, { freePoints: (attrs.freePoints ?? 0) + 3 });
    }

    // Record level reward
    const rewards = { credits: newLevel * 100, statPoints: 3, skillPoints: 1 };
    await db.insert(characterLevelRewards).values({
      characterId, level: newLevel, rewardType: "level_up", rewardValue: rewards,
    }).onConflictDoNothing();

    return { newLevel, rewards };
  }

  // ── Equipment ──────────────────────────────────────────────────────────────

  async equipItem(input: EquipItemInput): Promise<EquippedItem> {
    await db.insert(characterEquipment).values({
      characterId: input.characterId,
      slot:       input.slot as typeof characterEquipment.$inferInsert["slot"],
      itemId:     input.itemId,
      itemName:   input.itemName,
      itemIcon:   input.itemIcon ?? null,
      itemRarity: input.itemRarity ?? null,
      statBonus:  input.statBonus ?? null,
    }).onConflictDoNothing();

    const [row] = await db.update(characterEquipment).set({
      itemId:     input.itemId,
      itemName:   input.itemName,
      itemIcon:   input.itemIcon ?? null,
      itemRarity: input.itemRarity ?? null,
      statBonus:  input.statBonus ?? null,
      equippedAt: new Date(),
      updatedAt:  new Date(),
    }).where(and(
      eq(characterEquipment.characterId, input.characterId),
      eq(characterEquipment.slot, input.slot as typeof characterEquipment.$inferInsert["slot"]),
    )).returning();

    await this.updatePowerScore(input.characterId);
    return toEquipped(row!);
  }

  async unequipItem(characterId: string, slot: EquippedItem["slot"]): Promise<void> {
    await db.update(characterEquipment).set({
      itemId: null, itemName: null, itemIcon: null, itemRarity: null, statBonus: null, updatedAt: new Date(),
    }).where(and(
      eq(characterEquipment.characterId, characterId),
      eq(characterEquipment.slot, slot as typeof characterEquipment.$inferInsert["slot"]),
    ));
    await this.updatePowerScore(characterId);
  }

  async getEquipment(characterId: string): Promise<EquippedItem[]> {
    const rows = await db.select().from(characterEquipment).where(eq(characterEquipment.characterId, characterId));
    return rows.map(toEquipped);
  }

  // ── Skills ─────────────────────────────────────────────────────────────────

  async getSkillTree(class_: CharacterClass): Promise<SkillDefinition[]> {
    const rows = await db.select().from(skillTrees).where(eq(skillTrees.class, class_));
    return rows.map(toSkillDef);
  }

  async learnSkill(input: LearnSkillInput): Promise<LearnedSkill> {
    const [row] = await db.insert(characterSkills).values({
      characterId: input.characterId,
      skillId:     input.skillId,
    }).onConflictDoNothing().returning();

    if (!row) {
      const [existing] = await db.select().from(characterSkills)
        .where(and(eq(characterSkills.characterId, input.characterId), eq(characterSkills.skillId, input.skillId)));
      return toLearnedSkill(existing!);
    }
    return toLearnedSkill(row);
  }

  async upgradeSkill(characterId: string, skillId: string): Promise<LearnedSkill> {
    const skill = await db.select().from(skillTrees).where(eq(skillTrees.id, skillId));
    const maxLevel = skill[0]?.maxLevel ?? 10;

    const [row] = await db.update(characterSkills).set({
      level: Math.min(maxLevel, 99),
      updatedAt: new Date(),
    }).where(and(
      eq(characterSkills.characterId, characterId),
      eq(characterSkills.skillId, skillId),
    )).returning();

    if (!row) throw new Error("Skill chưa được học");
    return toLearnedSkill(row);
  }

  async getLearnedSkills(characterId: string): Promise<LearnedSkill[]> {
    const rows = await db.select().from(characterSkills).where(eq(characterSkills.characterId, characterId));
    return rows.map(toLearnedSkill);
  }

  private async getLearnedSkillsWithDef(characterId: string): Promise<LearnedSkill[]> {
    const learned = await this.getLearnedSkills(characterId);
    const skillIds = learned.map(s => s.skillId);
    if (skillIds.length === 0) return learned;

    const defs = await Promise.all(skillIds.map(id =>
      db.select().from(skillTrees).where(eq(skillTrees.id, id)).then(rows => rows[0])
    ));
    const defMap = new Map(defs.filter(Boolean).map(d => [d!.id, toSkillDef(d!)]));
    return learned.map(s => ({ ...s, skill: defMap.get(s.skillId) }));
  }

  // ── Titles ─────────────────────────────────────────────────────────────────

  async getTitles(characterId: string): Promise<CharacterTitle[]> {
    const rows = await db.select().from(characterTitles).where(eq(characterTitles.characterId, characterId));
    return rows.map(toTitle);
  }

  async unlockTitle(characterId: string, titleKey: string, titleName: string, titleDesc?: string): Promise<CharacterTitle> {
    const [existing] = await db.select().from(characterTitles)
      .where(and(eq(characterTitles.characterId, characterId), eq(characterTitles.titleKey, titleKey)));
    if (existing) return toTitle(existing);

    const [row] = await db.insert(characterTitles).values({
      characterId, titleKey, titleName, titleDesc: titleDesc ?? null,
    }).returning();
    return toTitle(row!);
  }

  async selectTitle(characterId: string, titleKey: string): Promise<void> {
    // Clear all selected
    await db.update(characterTitles).set({ isSelected: false })
      .where(eq(characterTitles.characterId, characterId));
    // Set new
    await db.update(characterTitles).set({ isSelected: true })
      .where(and(eq(characterTitles.characterId, characterId), eq(characterTitles.titleKey, titleKey)));
    // Update character display title
    const [title] = await db.select().from(characterTitles)
      .where(and(eq(characterTitles.characterId, characterId), eq(characterTitles.titleKey, titleKey)));
    if (title) {
      await db.update(characters).set({ title: title.titleName, updatedAt: new Date() })
        .where(eq(characters.id, characterId));
    }
  }

  // ── Presets ────────────────────────────────────────────────────────────────

  async savePreset(characterId: string, name: string): Promise<CharacterPreset> {
    const [equipment, skills, attributes] = await Promise.all([
      this.getEquipment(characterId),
      this.getLearnedSkills(characterId),
      this.getAttributes(characterId),
    ]);

    const [row] = await db.insert(characterPresets).values({
      characterId, name,
      equipment: equipment as unknown as Record<string, unknown>,
      skills:    skills    as unknown as Record<string, unknown>,
      attributes:attributes as unknown as Record<string, unknown>,
    }).returning();
    return toPreset(row!);
  }

  async loadPreset(characterId: string, presetId: string): Promise<CharacterPreset> {
    const [row] = await db.select().from(characterPresets)
      .where(and(eq(characterPresets.characterId, characterId), eq(characterPresets.id, presetId)));
    if (!row) throw new Error("Preset không tồn tại");
    return toPreset(row);
  }

  async getPresets(characterId: string): Promise<CharacterPreset[]> {
    const rows = await db.select().from(characterPresets).where(eq(characterPresets.characterId, characterId));
    return rows.map(toPreset);
  }

  // ── Customization ──────────────────────────────────────────────────────────

  async getCustomization(characterId: string): Promise<CharacterCustomization | null> {
    const [row] = await db.select().from(characterCustomization).where(eq(characterCustomization.characterId, characterId));
    return row ? toCustomization(row) : null;
  }

  async updateCustomization(characterId: string, data: Partial<Omit<CharacterCustomization, "id" | "characterId">>): Promise<CharacterCustomization> {
    await db.insert(characterCustomization).values({ characterId }).onConflictDoNothing();
    const [row] = await db.update(characterCustomization).set({ ...data, updatedAt: new Date() })
      .where(eq(characterCustomization.characterId, characterId)).returning();
    return toCustomization(row!);
  }

  // ── Logs ───────────────────────────────────────────────────────────────────

  async getExperienceLogs(characterId: string, limit = 20): Promise<ExperienceLog[]> {
    const rows = await db.select().from(characterExperienceLogs)
      .where(eq(characterExperienceLogs.characterId, characterId))
      .orderBy(desc(characterExperienceLogs.createdAt)).limit(limit);
    return rows.map(toXpLog);
  }

  // ── Power Score ────────────────────────────────────────────────────────────

  async updatePowerScore(characterId: string): Promise<number> {
    const [char, stats, equipment] = await Promise.all([
      this.getCharacter(characterId),
      this.getStats(characterId),
      this.getEquipment(characterId),
    ]);

    let score = (char?.level ?? 1) * 50;
    if (stats) score += stats.attack * 2 + stats.defense * 1.5 + stats.speed;
    for (const item of equipment) {
      if (item.statBonus) {
        for (const v of Object.values(item.statBonus)) score += Number(v);
      }
    }
    const finalScore = Math.floor(score);
    await db.update(characters).set({ powerScore: finalScore, updatedAt: new Date() })
      .where(eq(characters.id, characterId));
    return finalScore;
  }

  // ── Seeds ──────────────────────────────────────────────────────────────────

  async seedLevelTable(): Promise<void> {
    for (let level = 1; level <= 100; level++) {
      await db.insert(characterLevels).values({
        level, xpRequired: XP_PER_LEVEL(level),
        statPointReward: 3, skillPointReward: 1,
        creditReward: level * 100,
        description: `Cấp ${level}`,
      }).onConflictDoNothing();
    }
  }

  async seedSkillTrees(): Promise<void> {
    const classes: CharacterClass[] = ["WARRIOR", "MAGE", "ARCHER", "ASSASSIN", "ENGINEER", "SUMMONER"];
    const classSkills: Record<CharacterClass, Array<{ name: string; desc: string; icon: string; type: "ACTIVE" | "PASSIVE" | "ULTIMATE" }>> = {
      WARRIOR:  [
        { name: "Chém mạnh",    desc: "Một nhát chém gây sát thương cao",        icon: "⚔️", type: "ACTIVE" },
        { name: "Phòng thủ",    desc: "Tăng phòng thủ tạm thời",                 icon: "🛡️", type: "ACTIVE" },
        { name: "Rage",         desc: "Tăng sát thương 50% trong 10 giây",       icon: "💢", type: "ULTIMATE" },
        { name: "Sức mạnh vật lý", desc: "Tăng attack vĩnh viễn",               icon: "💪", type: "PASSIVE" },
      ],
      MAGE:     [
        { name: "Cầu lửa",     desc: "Bắn quả cầu lửa gây sát thương diện",     icon: "🔥", type: "ACTIVE" },
        { name: "Băng kết",    desc: "Đóng băng kẻ địch trong 3 giây",           icon: "❄️", type: "ACTIVE" },
        { name: "Bão thiên thạch", desc: "Triệu hồi thiên thạch gây AoE",       icon: "☄️", type: "ULTIMATE" },
        { name: "Thiền định",  desc: "Tái sinh MP nhanh hơn",                    icon: "🧿", type: "PASSIVE" },
      ],
      ARCHER:   [
        { name: "Bắn nhanh",   desc: "Bắn 3 mũi tên liên tiếp",                 icon: "🏹", type: "ACTIVE" },
        { name: "Bẫy",         desc: "Đặt bẫy làm chậm kẻ địch",               icon: "🪤", type: "ACTIVE" },
        { name: "Mưa tên",     desc: "Bắn hàng trăm mũi tên từ trên trời",      icon: "🌧️", type: "ULTIMATE" },
        { name: "Mắt đại bàng","desc": "Tăng tầm bắn và tỉ lệ chí mạng",        icon: "👁️", type: "PASSIVE" },
      ],
      ASSASSIN: [
        { name: "Đâm lén",     desc: "Tấn công từ bóng tối gây sát thương x2",  icon: "🗡️", type: "ACTIVE" },
        { name: "Tàng hình",   desc: "Biến vô hình trong 5 giây",               icon: "👤", type: "ACTIVE" },
        { name: "Kẻ hủy diệt","desc": "Xóa sổ mục tiêu, instant kill <20% HP",  icon: "💀", type: "ULTIMATE" },
        { name: "Nhanh nhẹn",  desc: "Tăng speed vĩnh viễn",                    icon: "⚡", type: "PASSIVE" },
      ],
      ENGINEER: [
        { name: "Triển khai turret", desc: "Đặt turret tự động tấn công kẻ địch",icon: "🔫", type: "ACTIVE" },
        { name: "Lựu đạn",    desc: "Ném lựu đạn gây AoE",                      icon: "💣", type: "ACTIVE" },
        { name: "Mech Suit",  desc: "Mặc giáp mech tăng toàn bộ stats x3",      icon: "🤖", type: "ULTIMATE" },
        { name: "Tay nghề",   desc: "Giảm cooldown tất cả skill",                icon: "🔧", type: "PASSIVE" },
      ],
      SUMMONER: [
        { name: "Triệu hồn thú","desc": "Gọi 1 thú chiến đấu cùng",             icon: "🐉", type: "ACTIVE" },
        { name: "Liên kết tâm linh","desc": "Chia sẻ HP với thú cưng",          icon: "❤️", type: "ACTIVE" },
        { name: "Hủy diệt tập thể","desc": "Triệu hồi đội quân 10 thú cùng lúc",icon: "🌊", type: "ULTIMATE" },
        { name: "Cộng sinh",  desc: "Thú cưng tăng sát thương theo level",      icon: "🌿", type: "PASSIVE" },
      ],
    };

    for (const cls of classes) {
      for (const skill of classSkills[cls]) {
        await db.insert(skillTrees).values({
          class:       cls,
          name:        skill.name,
          description: skill.desc,
          icon:        skill.icon,
          skillType:   skill.type,
          maxLevel:    10,
          baseDamage:  cls === "WARRIOR" ? 50 : cls === "MAGE" ? 80 : 40,
          baseCooldown: 5,
          mpCost:      skill.type === "ULTIMATE" ? 100 : 20,
        }).onConflictDoNothing();
      }
    }
  }
}
