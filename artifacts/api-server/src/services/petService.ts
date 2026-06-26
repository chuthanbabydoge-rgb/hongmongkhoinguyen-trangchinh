// ─────────────────────────────────────────────────────────────────────────────
// PetService — HUB-20
// ─────────────────────────────────────────────────────────────────────────────

import type { IPetRepository, CreatePetInput, PetType } from "../repositories/petRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { petEventBus } from "./petEventBus.js";

export class PetError extends Error {
  constructor(message: string, public code = "PET_ERROR", public status = 400) {
    super(message); this.name = "PetError";
  }
}

export class PetService {
  constructor(
    private readonly repo:           IPetRepository,
    private readonly notifService:   NotificationsService,
    private readonly actService:     ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Species ────────────────────────────────────────────────────────────────

  async listSpecies() { return this.repo.listSpecies(); }
  async getSpecies(id: string) { return this.repo.getSpecies(id); }

  // ── Pet CRUD ───────────────────────────────────────────────────────────────

  async createPet(userId: string, input: Omit<CreatePetInput, "userId">) {
    const pet = await this.repo.createPet({ ...input, userId });

    petEventBus.publish({ type: "PET_CREATED", userId, entityId: pet.id, payload: { name: pet.name, type: pet.type, rarity: pet.rarity } });

    this.actService.fire({ userId, type: "system" as never, title: `Tạo pet: ${pet.name}`, description: `${pet.type} · ${pet.rarity}`, metadata: { petId: pet.id } });

    await this.notifService.send(userId, { title: "🐾 Pet mới!", message: `Bạn đã có pet: ${pet.name}!`, type: "system" as never });

    await this.reputationRepo.updateReputation(userId, { reason: "first_pet", delta: 10 });

    return pet;
  }

  async deletePet(userId: string, petId: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền xóa pet này", "FORBIDDEN", 403);
    await this.repo.deletePet(petId);
    return { ok: true };
  }

  async listPets(userId: string) { return this.repo.listPets(userId); }

  async getPet(petId: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    return pet;
  }

  async getSummonedPet(userId: string) { return this.repo.getSummonedPet(userId); }

  // ── Feed ───────────────────────────────────────────────────────────────────

  async feedPet(userId: string, petId: string, foodKey?: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);

    const hungerRestore   = 30;
    const happinessBoost  = 10;
    const updated = await this.repo.feedPet(petId, hungerRestore, happinessBoost);

    petEventBus.publish({ type: "PET_FED", userId, entityId: petId, payload: { foodKey, hunger: updated.hunger, happiness: updated.happiness } });

    await this.repo.updateBond(petId, userId, 5);

    this.actService.fire({ userId, type: "system" as never, title: `Cho ${pet.name} ăn`, description: `Hunger +${hungerRestore}`, metadata: { petId } });

    return updated;
  }

  // ── Train ──────────────────────────────────────────────────────────────────

  async trainPet(userId: string, petId: string, trainingType = "combat") {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);

    const result = await this.repo.trainPet(petId, userId, trainingType);

    petEventBus.publish({ type: "PET_TRAINED", userId, entityId: petId, payload: { trainingType, xpGained: result.training.xpGained } });

    this.actService.fire({ userId, type: "system" as never, title: `Huấn luyện ${pet.name}`, description: `${trainingType} — XP +${result.training.xpGained}`, metadata: { petId } });

    const { pet: leveledPet, leveled, newLevel } = await this.repo.gainXp(petId, result.training.xpGained);
    if (leveled) {
      petEventBus.publish({ type: "PET_LEVEL_UP", userId, entityId: petId, payload: { newLevel } });
      await this.notifService.send(userId, { title: "🎉 Pet lên cấp!", message: `${pet.name} đã lên cấp ${newLevel}!`, type: "system" as never });
    }

    return { pet: leveledPet, training: result.training, leveled, newLevel };
  }

  // ── Evolve ─────────────────────────────────────────────────────────────────

  async evolvePet(userId: string, petId: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);

    const species = await this.repo.getSpecies(pet.speciesId);
    const requiredLevel = species?.evolutionLevel ?? 20;
    if (pet.level < requiredLevel) throw new PetError(`Cần level ${requiredLevel} để tiến hóa`, "LEVEL_REQUIRED", 400);

    const result = await this.repo.evolvePet(petId, userId);

    petEventBus.publish({ type: "PET_EVOLVED", userId, entityId: petId, payload: { fromStage: result.evolution.fromStage, toStage: result.evolution.toStage } });

    await this.notifService.send(userId, { title: "✨ Pet tiến hóa!", message: `${pet.name} đã tiến hóa lên giai đoạn ${result.evolution.toStage}!`, type: "system" as never });

    this.actService.fire({ userId, type: "system" as never, title: `${pet.name} tiến hóa!`, description: `Stage ${result.evolution.fromStage} → ${result.evolution.toStage}`, metadata: { petId } });

    await this.reputationRepo.updateReputation(userId, { reason: "pet_evolved", delta: 20 });

    return result;
  }

  // ── Equip ──────────────────────────────────────────────────────────────────

  async equipPet(userId: string, petId: string, slot: string, itemId: string, itemName: string, itemIcon?: string, itemRarity?: string, statBonus?: Record<string, number>) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);

    const equipment = await this.repo.equipPet(petId, slot, itemId, itemName, itemIcon, itemRarity, statBonus);

    petEventBus.publish({ type: "PET_EQUIPPED", userId, entityId: petId, payload: { slot, itemName } });
    this.actService.fire({ userId, type: "system" as never, title: `Trang bị cho ${pet.name}`, description: `${slot}: ${itemName}`, metadata: { petId } });

    return equipment;
  }

  async unequipPet(userId: string, petId: string, slot: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);
    await this.repo.unequipPet(petId, slot);
    return { ok: true };
  }

  async getEquipment(petId: string) { return this.repo.getEquipment(petId); }

  // ── Skills ─────────────────────────────────────────────────────────────────

  async listSkills(petType?: PetType) { return this.repo.listSkills(petType); }

  async learnSkill(userId: string, petId: string, skillId: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);

    const result = await this.repo.learnPetSkill(petId, skillId);

    petEventBus.publish({ type: "PET_SKILL_UNLOCKED", userId, entityId: petId, payload: { skillId } });
    await this.notifService.send(userId, { title: "✨ Skill mới!", message: `${pet.name} vừa học kỹ năng mới!`, type: "system" as never });
    this.actService.fire({ userId, type: "system" as never, title: `${pet.name} học skill`, description: result.skill?.name ?? skillId, metadata: { petId, skillId } });

    return result;
  }

  async getLearnedSkills(petId: string) { return this.repo.getLearnedSkills(petId); }

  // ── Summon / Dismiss ───────────────────────────────────────────────────────

  async summonPet(userId: string, petId: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);

    const result = await this.repo.summonPet(petId, userId);

    petEventBus.publish({ type: "PET_SUMMONED", userId, entityId: petId, payload: { name: pet.name } });
    this.actService.fire({ userId, type: "system" as never, title: `Triệu hồi ${pet.name}`, description: "Pet sẵn sàng chiến đấu", metadata: { petId } });

    return result;
  }

  async dismissPet(userId: string, petId: string) {
    const pet = await this.repo.getPet(petId);
    if (!pet) throw new PetError("Pet không tồn tại", "NOT_FOUND", 404);
    if (pet.userId !== userId) throw new PetError("Không có quyền", "FORBIDDEN", 403);

    const result = await this.repo.dismissPet(petId, userId);

    petEventBus.publish({ type: "PET_DISMISSED", userId, entityId: petId, payload: { name: pet.name } });

    return result;
  }

  // ── Bond & Logs ────────────────────────────────────────────────────────────

  async getBond(petId: string, userId: string) { return this.repo.getBond(petId, userId); }
  async getLogs(petId: string) { return this.repo.getLogs(petId); }
}
