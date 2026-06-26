// ─────────────────────────────────────────────────────────────────────────────
// CharacterService — HUB-18
// ─────────────────────────────────────────────────────────────────────────────

import type { ICharacterRepository, Character, CharacterFull, CreateCharacterInput, UpdateCharacterInput, EquipItemInput, LearnSkillInput, CharacterClass, EquipmentSlot } from "../repositories/characterRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { characterEventBus } from "./characterEventBus.js";

export class CharacterError extends Error {
  constructor(message: string, public code = "CHARACTER_ERROR", public status = 400) {
    super(message);
    this.name = "CharacterError";
  }
}

export class CharacterService {
  constructor(
    private readonly repo:           ICharacterRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Create / Get ───────────────────────────────────────────────────────────

  async createCharacter(userId: string, input: Omit<CreateCharacterInput, "userId">): Promise<Character> {
    const existing = await this.repo.getCharacterByUserId(userId);
    if (existing) throw new CharacterError("Người dùng đã có nhân vật", "ALREADY_EXISTS", 409);

    const character = await this.repo.createCharacter({ ...input, userId });

    characterEventBus.publish({
      type: "CHARACTER_CREATED", characterId: character.id, userId,
      payload: { name: character.name, class: character.class, race: character.race },
    });

    this.actService.fire({
      userId, type: "system" as never,
      title: `Tạo nhân vật: ${character.name}`,
      description: `Lớp ${character.class} | ${character.race}`,
      metadata: { characterId: character.id },
    });

    return character;
  }

  async getMyCharacter(userId: string): Promise<CharacterFull | null> {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) return null;
    return this.repo.getCharacterFull(char.id);
  }

  async updateCharacter(userId: string, input: UpdateCharacterInput): Promise<Character> {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.updateCharacter(char.id, input);
  }

  async deleteCharacter(userId: string): Promise<void> {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    await this.repo.deleteCharacter(char.id);
  }

  async getStats(userId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.getStats(char.id);
  }

  // ── Experience ─────────────────────────────────────────────────────────────

  async gainExperience(userId: string, amount: number, source: string, sourceId?: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);

    const result = await this.repo.gainExperience(char.id, amount, source, sourceId);

    characterEventBus.publish({
      type: "EXPERIENCE_GAINED", characterId: char.id, userId,
      payload: { amount, source, newTotal: result.newTotal },
    });

    if (result.leveled) {
      const levelResult = await this.repo.levelUp(char.id);
      characterEventBus.publish({
        type: "LEVEL_UP", characterId: char.id, userId,
        payload: { newLevel: levelResult.newLevel, rewards: levelResult.rewards },
      });

      await this.notifService.send(userId, {
        title:   "🎉 Lên cấp!",
        message: `Chúc mừng! Nhân vật của bạn đã lên cấp ${levelResult.newLevel}!`,
        type:    "system" as never,
        data:    levelResult.rewards,
      });

      this.actService.fire({
        userId, type: "system" as never,
        title: `Lên cấp ${levelResult.newLevel}!`,
        description: `Nhận ${JSON.stringify(levelResult.rewards)}`,
        metadata: { characterId: char.id, newLevel: levelResult.newLevel },
      });

      await this.reputationRepo.updateReputation(userId, {
        reason: `level_up_${levelResult.newLevel}`,
        delta:  levelResult.newLevel * 5,
      });
    }

    return result;
  }

  // ── Equipment ──────────────────────────────────────────────────────────────

  async equipItem(userId: string, input: Omit<EquipItemInput, "characterId">) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);

    const item = await this.repo.equipItem({ ...input, characterId: char.id });

    characterEventBus.publish({
      type: "ITEM_EQUIPPED", characterId: char.id, userId,
      payload: { slot: input.slot, itemId: input.itemId, itemName: input.itemName },
    });

    this.actService.fire({
      userId, type: "system" as never,
      title: `Trang bị: ${input.itemName}`,
      description: `Slot: ${input.slot}`,
      metadata: { characterId: char.id, itemId: input.itemId },
    });

    return item;
  }

  async unequipItem(userId: string, slot: EquipmentSlot) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);

    await this.repo.unequipItem(char.id, slot);

    characterEventBus.publish({
      type: "ITEM_UNEQUIPPED", characterId: char.id, userId,
      payload: { slot },
    });
  }

  async getEquipment(userId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.getEquipment(char.id);
  }

  // ── Skills ─────────────────────────────────────────────────────────────────

  async getSkillTree(userId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    const [tree, learned] = await Promise.all([
      this.repo.getSkillTree(char.class as CharacterClass),
      this.repo.getLearnedSkills(char.id),
    ]);
    const learnedMap = new Map(learned.map(s => [s.skillId, s]));
    return tree.map(skill => ({
      ...skill,
      learned: learnedMap.has(skill.id),
      learnedLevel: learnedMap.get(skill.id)?.level ?? 0,
    }));
  }

  async learnSkill(userId: string, skillId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);

    const skill = await this.repo.learnSkill({ characterId: char.id, skillId });

    characterEventBus.publish({
      type: "SKILL_UNLOCKED", characterId: char.id, userId,
      payload: { skillId },
    });

    await this.notifService.send(userId, {
      title:   "✨ Skill mới!",
      message: "Bạn vừa học được một skill mới!",
      type:    "system" as never,
    });

    return skill;
  }

  async upgradeSkill(userId: string, skillId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);

    const skill = await this.repo.upgradeSkill(char.id, skillId);

    characterEventBus.publish({
      type: "SKILL_UPGRADED", characterId: char.id, userId,
      payload: { skillId, newLevel: skill.level },
    });

    return skill;
  }

  // ── Titles ─────────────────────────────────────────────────────────────────

  async getTitles(userId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.getTitles(char.id);
  }

  async selectTitle(userId: string, titleKey: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    await this.repo.selectTitle(char.id, titleKey);
    return { ok: true, titleKey };
  }

  // ── Presets ────────────────────────────────────────────────────────────────

  async getPresets(userId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.getPresets(char.id);
  }

  async savePreset(userId: string, name: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.savePreset(char.id, name);
  }

  async loadPreset(userId: string, presetId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.loadPreset(char.id, presetId);
  }

  // ── Customization / Appearance ─────────────────────────────────────────────

  async getCustomization(userId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.getCustomization(char.id);
  }

  async updateAppearance(userId: string, data: Record<string, unknown>) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) throw new CharacterError("Nhân vật không tồn tại", "NOT_FOUND", 404);
    return this.repo.updateCustomization(char.id, data as never);
  }

  // ── Experience Logs ────────────────────────────────────────────────────────

  async getExperienceLogs(userId: string) {
    const char = await this.repo.getCharacterByUserId(userId);
    if (!char) return [];
    return this.repo.getExperienceLogs(char.id);
  }
}
