// ─────────────────────────────────────────────────────────────────────────────
// DrizzlePetRepository — HUB-20
// ─────────────────────────────────────────────────────────────────────────────

import { eq, and, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  pets, petSpecies, petSkills, petLevels, petEquipment,
  petTraining, petEvolution, petBonds, petLogs, petLearnedSkills,
} from "@workspace/db";
import type {
  IPetRepository, Pet, PetSpecies, PetSkill, PetLearnedSkill,
  PetEquipment, PetTrainingRecord, PetEvolutionRecord,
  PetBond, PetLog, CreatePetInput, PetType,
} from "../petRepository.js";
import { createId } from "@paralleldrive/cuid2";

function toPet(row: typeof pets.$inferSelect): Pet {
  return {
    id: row.id, userId: row.userId, speciesId: row.speciesId,
    name: row.name, nickname: row.nickname,
    type: row.type as Pet["type"], rarity: row.rarity as Pet["rarity"],
    level: row.level, experience: row.experience,
    happiness: row.happiness, hunger: row.hunger, loyalty: row.loyalty,
    hp: row.hp, maxHp: row.maxHp, attack: row.attack, defense: row.defense, speed: row.speed,
    isSummoned: row.isSummoned, isActive: row.isActive,
    evolutionStage: row.evolutionStage,
    lastFedAt: row.lastFedAt ? row.lastFedAt.toISOString() : null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toSpecies(row: typeof petSpecies.$inferSelect): PetSpecies {
  return {
    id: row.id, name: row.name, description: row.description,
    type: row.type as PetSpecies["type"], rarity: row.rarity as PetSpecies["rarity"],
    icon: row.icon, maxLevel: row.maxLevel,
    evolutionLevel: row.evolutionLevel, evolutionInto: row.evolutionInto,
    baseHp: row.baseHp, baseAttack: row.baseAttack,
    baseDefense: row.baseDefense, baseSpeed: row.baseSpeed,
    baseHappiness: row.baseHappiness,
    bondBonus: row.bondBonus as Record<string, unknown> | null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toSkill(row: typeof petSkills.$inferSelect): PetSkill {
  return {
    id: row.id, name: row.name, description: row.description,
    icon: row.icon, type: row.type,
    baseDamage: row.baseDamage, baseHealing: row.baseHealing,
    cooldown: row.cooldown, energyCost: row.energyCost,
    petType: row.petType as PetType | null, minLevel: row.minLevel,
    metadata: row.metadata as Record<string, unknown> | null,
  };
}

export class DrizzlePetRepository implements IPetRepository {

  // ── Species ────────────────────────────────────────────────────────────────

  async listSpecies(): Promise<PetSpecies[]> {
    const rows = await db.select().from(petSpecies).orderBy(petSpecies.rarity);
    return rows.map(toSpecies);
  }

  async getSpecies(id: string): Promise<PetSpecies | null> {
    const [row] = await db.select().from(petSpecies).where(eq(petSpecies.id, id));
    return row ? toSpecies(row) : null;
  }

  async seedSpecies(): Promise<void> {
    const SPECIES = [
      { name: "Blazecat",   type: "BEAST",      rarity: "COMMON",    icon: "🐱", baseHp: 80,  baseAttack: 12, baseDefense: 5,  baseSpeed: 15, evolutionLevel: 20, evolutionInto: null },
      { name: "Stormwing",  type: "DRAGON",     rarity: "RARE",      icon: "🐉", baseHp: 120, baseAttack: 20, baseDefense: 10, baseSpeed: 12, evolutionLevel: 30, evolutionInto: null },
      { name: "Lumisprite", type: "SPIRIT",     rarity: "UNCOMMON",  icon: "✨", baseHp: 70,  baseAttack: 8,  baseDefense: 8,  baseSpeed: 18, evolutionLevel: 25, evolutionInto: null },
      { name: "Ironclad",   type: "MECHANICAL", rarity: "EPIC",      icon: "🤖", baseHp: 150, baseAttack: 15, baseDefense: 20, baseSpeed: 8,  evolutionLevel: 35, evolutionInto: null },
      { name: "Emberkin",   type: "ELEMENTAL",  rarity: "UNCOMMON",  icon: "🔥", baseHp: 90,  baseAttack: 16, baseDefense: 7,  baseSpeed: 14, evolutionLevel: 25, evolutionInto: null },
      { name: "Starwhale",  type: "CELESTIAL",  rarity: "LEGENDARY", icon: "🐋", baseHp: 200, baseAttack: 25, baseDefense: 15, baseSpeed: 10, evolutionLevel: 50, evolutionInto: null },
      { name: "Shadowfox",  type: "BEAST",      rarity: "UNCOMMON",  icon: "🦊", baseHp: 85,  baseAttack: 14, baseDefense: 6,  baseSpeed: 16, evolutionLevel: 20, evolutionInto: null },
      { name: "Voiddrake",  type: "DRAGON",     rarity: "MYTHIC",    icon: "🐲", baseHp: 250, baseAttack: 35, baseDefense: 20, baseSpeed: 15, evolutionLevel: null, evolutionInto: null },
    ];
    for (const s of SPECIES) {
      await db.insert(petSpecies).values({
        name: s.name, type: s.type as never, rarity: s.rarity as never,
        icon: s.icon, maxLevel: 100,
        baseHp: s.baseHp, baseAttack: s.baseAttack,
        baseDefense: s.baseDefense, baseSpeed: s.baseSpeed, baseHappiness: 100,
        evolutionLevel: s.evolutionLevel, evolutionInto: s.evolutionInto,
      }).onConflictDoNothing();
    }
  }

  // ── Pet CRUD ───────────────────────────────────────────────────────────────

  async createPet(input: CreatePetInput): Promise<Pet> {
    const species = await this.getSpecies(input.speciesId);
    const [row] = await db.insert(pets).values({
      userId: input.userId, speciesId: input.speciesId,
      name: input.name, nickname: input.nickname ?? null,
      type: (input.type ?? species?.type ?? "BEAST") as never,
      rarity: (input.rarity ?? species?.rarity ?? "COMMON") as never,
      hp: species?.baseHp ?? 100, maxHp: species?.baseHp ?? 100,
      attack: species?.baseAttack ?? 10, defense: species?.baseDefense ?? 5,
      speed: species?.baseSpeed ?? 10, happiness: species?.baseHappiness ?? 100,
    }).returning();
    await db.insert(petBonds).values({ petId: row!.id, userId: input.userId }).onConflictDoNothing();
    return toPet(row!);
  }

  async deletePet(petId: string): Promise<void> {
    await db.delete(pets).where(eq(pets.id, petId));
  }

  async getPet(petId: string): Promise<Pet | null> {
    const [row] = await db.select().from(pets).where(eq(pets.id, petId));
    return row ? toPet(row) : null;
  }

  async listPets(userId: string): Promise<Pet[]> {
    const rows = await db.select().from(pets)
      .where(and(eq(pets.userId, userId), eq(pets.isActive, true)))
      .orderBy(desc(pets.level));
    return rows.map(toPet);
  }

  async updatePet(petId: string, data: Partial<Pet>): Promise<Pet> {
    const [row] = await db.update(pets).set({ ...data, updatedAt: new Date() } as never)
      .where(eq(pets.id, petId)).returning();
    return toPet(row!);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async feedPet(petId: string, hungerRestore: number, happinessBoost: number): Promise<Pet> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const newHunger    = Math.min(100, pet.hunger + hungerRestore);
    const newHappiness = Math.min(100, pet.happiness + happinessBoost);
    const [row] = await db.update(pets).set({
      hunger: newHunger, happiness: newHappiness,
      lastFedAt: new Date(), updatedAt: new Date(),
    }).where(eq(pets.id, petId)).returning();
    await this.addLog(petId, pet.userId, "FED", `Hunger +${hungerRestore}, Happiness +${happinessBoost}`);
    return toPet(row!);
  }

  async trainPet(petId: string, userId: string, trainingType: string): Promise<{ pet: Pet; training: PetTrainingRecord }> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const xpGained  = Math.floor(20 + pet.level * 5);
    const statGain   = Math.floor(1 + pet.level * 0.2);
    const statMap: Record<string, keyof Pet> = {
      combat: "attack", defense: "defense", speed: "speed",
    };
    const statKey = statMap[trainingType] ?? "attack";
    const [trainingRow] = await db.insert(petTraining).values({
      petId, userId, trainingType, xpGained,
      statImproved: statKey, statGain, cost: 50, duration: 60,
      completedAt: new Date(),
    }).returning();
    const update: Record<string, unknown> = {
      experience: pet.experience + xpGained, updatedAt: new Date(),
      [statKey]: (pet[statKey] as number) + statGain,
    };
    const [updated] = await db.update(pets).set(update as never).where(eq(pets.id, petId)).returning();
    await this.addLog(petId, userId, "TRAINED", `${trainingType} — XP +${xpGained}, ${statKey} +${statGain}`);
    return {
      pet: toPet(updated!),
      training: {
        id: trainingRow!.id, petId, userId, trainingType, xpGained,
        statImproved: statKey, statGain, cost: 50, duration: 60,
        completedAt: trainingRow!.completedAt?.toISOString() ?? null,
        createdAt: trainingRow!.createdAt.toISOString(),
      },
    };
  }

  async levelPet(petId: string): Promise<Pet> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const [levelRow] = await db.select().from(petLevels).where(eq(petLevels.level, pet.level + 1));
    const newLevel   = pet.level + 1;
    const hpBonus    = levelRow?.hpBonus ?? 5;
    const atkBonus   = levelRow?.attackBonus ?? 2;
    const defBonus   = levelRow?.defenseBonus ?? 1;
    const spdBonus   = levelRow?.speedBonus ?? 1;
    const [row] = await db.update(pets).set({
      level: newLevel, experience: 0,
      maxHp: pet.maxHp + hpBonus, hp: pet.hp + hpBonus,
      attack: pet.attack + atkBonus, defense: pet.defense + defBonus,
      speed: pet.speed + spdBonus, updatedAt: new Date(),
    }).where(eq(pets.id, petId)).returning();
    await this.addLog(petId, pet.userId, "LEVEL_UP", `Level ${pet.level} → ${newLevel}`);
    return toPet(row!);
  }

  async evolvePet(petId: string, userId: string): Promise<{ pet: Pet; evolution: PetEvolutionRecord }> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const statsBefore = { hp: pet.hp, attack: pet.attack, defense: pet.defense, speed: pet.speed };
    const newStage    = pet.evolutionStage + 1;
    const hpBoost     = Math.floor(pet.maxHp * 0.3);
    const atkBoost    = Math.floor(pet.attack * 0.3);
    const defBoost    = Math.floor(pet.defense * 0.3);
    const spdBoost    = Math.floor(pet.speed * 0.2);
    const [updated] = await db.update(pets).set({
      evolutionStage: newStage,
      maxHp: pet.maxHp + hpBoost, hp: pet.hp + hpBoost,
      attack: pet.attack + atkBoost, defense: pet.defense + defBoost,
      speed: pet.speed + spdBoost, updatedAt: new Date(),
    }).where(eq(pets.id, petId)).returning();
    const statsAfter  = { hp: updated!.hp, attack: updated!.attack, defense: updated!.defense, speed: updated!.speed };
    const [evoRow] = await db.insert(petEvolution).values({
      petId, userId, fromStage: pet.evolutionStage, toStage: newStage,
      fromSpeciesId: pet.speciesId, toSpeciesId: pet.speciesId,
      statsBefore, statsAfter,
    }).returning();
    await this.addLog(petId, userId, "EVOLVED", `Stage ${pet.evolutionStage} → ${newStage}`);
    return {
      pet: toPet(updated!),
      evolution: {
        id: evoRow!.id, petId, userId,
        fromStage: evoRow!.fromStage, toStage: evoRow!.toStage,
        fromSpeciesId: evoRow!.fromSpeciesId, toSpeciesId: evoRow!.toSpeciesId,
        statsBefore: evoRow!.statsBefore as Record<string, unknown> | null,
        statsAfter:  evoRow!.statsAfter  as Record<string, unknown> | null,
        evolvedAt:   evoRow!.evolvedAt.toISOString(),
      },
    };
  }

  async equipPet(petId: string, slot: string, itemId: string, itemName: string, itemIcon?: string, itemRarity?: string, statBonus?: Record<string, number>): Promise<PetEquipment> {
    const [row] = await db.insert(petEquipment).values({
      petId, slot, itemId, itemName, itemIcon: itemIcon ?? null,
      itemRarity: itemRarity ?? null, statBonus: statBonus ?? null,
    }).onConflictDoNothing().returning();
    if (!row) {
      const [updated] = await db.update(petEquipment).set({
        itemId, itemName, itemIcon: itemIcon ?? null,
        itemRarity: itemRarity ?? null, statBonus: statBonus ?? null,
        updatedAt: new Date(),
      }).where(and(eq(petEquipment.petId, petId), eq(petEquipment.slot, slot))).returning();
      return {
        id: updated!.id, petId, slot, itemId: updated!.itemId,
        itemName: updated!.itemName, itemIcon: updated!.itemIcon,
        itemRarity: updated!.itemRarity, statBonus: updated!.statBonus as Record<string, number> | null,
        equippedAt: updated!.equippedAt.toISOString(), updatedAt: updated!.updatedAt.toISOString(),
      };
    }
    return {
      id: row.id, petId, slot, itemId: row.itemId,
      itemName: row.itemName, itemIcon: row.itemIcon,
      itemRarity: row.itemRarity, statBonus: row.statBonus as Record<string, number> | null,
      equippedAt: row.equippedAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
    };
  }

  async unequipPet(petId: string, slot: string): Promise<void> {
    await db.update(petEquipment).set({
      itemId: null, itemName: null, itemIcon: null,
      itemRarity: null, statBonus: null, updatedAt: new Date(),
    }).where(and(eq(petEquipment.petId, petId), eq(petEquipment.slot, slot)));
  }

  async learnPetSkill(petId: string, skillId: string): Promise<PetLearnedSkill> {
    const [row] = await db.insert(petLearnedSkills).values({
      petId, skillId,
    }).onConflictDoNothing().returning();
    const skill = await db.select().from(petSkills).where(eq(petSkills.id, skillId));
    const s = skill[0];
    return {
      id: row?.id ?? createId(), petId, skillId,
      level: row?.level ?? 1, isEquipped: row?.isEquipped ?? false,
      learnedAt: (row?.learnedAt ?? new Date()).toISOString(),
      skill: s ? toSkill(s) : undefined,
    };
  }

  async summonPet(petId: string, userId: string): Promise<Pet> {
    await db.update(pets).set({ isSummoned: false, updatedAt: new Date() })
      .where(and(eq(pets.userId, userId), eq(pets.isSummoned, true)));
    const [row] = await db.update(pets).set({ isSummoned: true, updatedAt: new Date() })
      .where(eq(pets.id, petId)).returning();
    await this.addLog(petId, userId, "SUMMONED", "Pet summoned into battle");
    return toPet(row!);
  }

  async dismissPet(petId: string, userId: string): Promise<Pet> {
    const [row] = await db.update(pets).set({ isSummoned: false, updatedAt: new Date() })
      .where(eq(pets.id, petId)).returning();
    await this.addLog(petId, userId, "DISMISSED", "Pet dismissed from battle");
    return toPet(row!);
  }

  async getSummonedPet(userId: string): Promise<Pet | null> {
    const [row] = await db.select().from(pets)
      .where(and(eq(pets.userId, userId), eq(pets.isSummoned, true)));
    return row ? toPet(row) : null;
  }

  // ── Skills ─────────────────────────────────────────────────────────────────

  async listSkills(petType?: PetType): Promise<PetSkill[]> {
    const rows = petType
      ? await db.select().from(petSkills).where(eq(petSkills.petType, petType as never))
      : await db.select().from(petSkills);
    return rows.map(toSkill);
  }

  async getLearnedSkills(petId: string): Promise<PetLearnedSkill[]> {
    const rows = await db.select().from(petLearnedSkills).where(eq(petLearnedSkills.petId, petId));
    return rows.map(r => ({
      id: r.id, petId: r.petId, skillId: r.skillId,
      level: r.level, isEquipped: r.isEquipped,
      learnedAt: r.learnedAt.toISOString(),
    }));
  }

  async getEquipment(petId: string): Promise<PetEquipment[]> {
    const rows = await db.select().from(petEquipment).where(eq(petEquipment.petId, petId));
    return rows.map(r => ({
      id: r.id, petId: r.petId, slot: r.slot,
      itemId: r.itemId, itemName: r.itemName, itemIcon: r.itemIcon,
      itemRarity: r.itemRarity, statBonus: r.statBonus as Record<string, number> | null,
      equippedAt: r.equippedAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
    }));
  }

  // ── Bond ───────────────────────────────────────────────────────────────────

  async getBond(petId: string, userId: string): Promise<PetBond | null> {
    const [row] = await db.select().from(petBonds)
      .where(and(eq(petBonds.petId, petId), eq(petBonds.userId, userId)));
    if (!row) return null;
    return {
      id: row.id, petId: row.petId, userId: row.userId,
      bondLevel: row.bondLevel, bondPoints: row.bondPoints,
      bonusType: row.bonusType, bonusValue: row.bonusValue,
      lastInteract: row.lastInteract?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateBond(petId: string, userId: string, points: number): Promise<PetBond> {
    const existing = await this.getBond(petId, userId);
    const newPoints  = (existing?.bondPoints ?? 0) + points;
    const newLevel   = Math.floor(newPoints / 100) + 1;
    const [row] = await db.update(petBonds).set({
      bondPoints: newPoints, bondLevel: newLevel, lastInteract: new Date(), updatedAt: new Date(),
    }).where(and(eq(petBonds.petId, petId), eq(petBonds.userId, userId))).returning();
    return {
      id: row!.id, petId, userId,
      bondLevel: row!.bondLevel, bondPoints: row!.bondPoints,
      bonusType: row!.bonusType, bonusValue: row!.bonusValue,
      lastInteract: row!.lastInteract?.toISOString() ?? null,
      updatedAt: row!.updatedAt.toISOString(),
    };
  }

  // ── Logs ───────────────────────────────────────────────────────────────────

  async getLogs(petId: string, limit = 20): Promise<PetLog[]> {
    const rows = await db.select().from(petLogs).where(eq(petLogs.petId, petId))
      .orderBy(desc(petLogs.createdAt)).limit(limit);
    return rows.map(r => ({
      id: r.id, petId: r.petId, userId: r.userId,
      action: r.action, detail: r.detail,
      metadata: r.metadata as Record<string, unknown> | null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addLog(petId: string, userId: string, action: string, detail?: string, metadata?: Record<string, unknown>): Promise<void> {
    await db.insert(petLogs).values({ petId, userId, action, detail: detail ?? null, metadata: metadata ?? null });
  }

  // ── XP ─────────────────────────────────────────────────────────────────────

  async gainXp(petId: string, amount: number): Promise<{ pet: Pet; leveled: boolean; newLevel: number }> {
    const pet = await this.getPet(petId);
    if (!pet) throw new Error("Pet not found");
    const newXp = pet.experience + amount;
    const [levelRow] = await db.select().from(petLevels).where(eq(petLevels.level, pet.level));
    const xpNeeded = levelRow?.xpRequired ?? Math.floor(100 * Math.pow(pet.level + 1, 1.5));
    const leveled  = newXp >= xpNeeded;
    const [row] = await db.update(pets).set({ experience: newXp, updatedAt: new Date() })
      .where(eq(pets.id, petId)).returning();
    if (leveled) {
      const leveled_ = await this.levelPet(petId);
      return { pet: leveled_, leveled: true, newLevel: leveled_.level };
    }
    return { pet: toPet(row!), leveled: false, newLevel: pet.level };
  }

  // ── Seeds ──────────────────────────────────────────────────────────────────

  async seedLevelTable(): Promise<void> {
    for (let lv = 1; lv <= 100; lv++) {
      await db.insert(petLevels).values({
        level: lv, xpRequired: Math.floor(100 * Math.pow(lv + 1, 1.5)),
        hpBonus: 5 + lv, attackBonus: 2 + Math.floor(lv * 0.5),
        defenseBonus: 1 + Math.floor(lv * 0.3),
        speedBonus: 1 + Math.floor(lv * 0.2),
        creditReward: lv * 10,
      }).onConflictDoNothing();
    }
  }

  async seedSkills(): Promise<void> {
    const SKILLS = [
      { name: "Scratch",     type: "ACTIVE",  baseDamage: 15, baseHealing: 0,  energyCost: 10, cooldown: 1, petType: "BEAST" },
      { name: "Fire Breath", type: "ACTIVE",  baseDamage: 30, baseHealing: 0,  energyCost: 25, cooldown: 3, petType: "DRAGON" },
      { name: "Healing Aura",type: "ACTIVE",  baseDamage: 0,  baseHealing: 25, energyCost: 20, cooldown: 3, petType: "SPIRIT" },
      { name: "Iron Shield", type: "PASSIVE", baseDamage: 0,  baseHealing: 0,  energyCost: 0,  cooldown: 0, petType: "MECHANICAL" },
      { name: "Static Shock",type: "ACTIVE",  baseDamage: 20, baseHealing: 0,  energyCost: 15, cooldown: 2, petType: "ELEMENTAL" },
      { name: "Star Pulse",  type: "ULTIMATE",baseDamage: 60, baseHealing: 0,  energyCost: 50, cooldown: 5, petType: "CELESTIAL" },
      { name: "Bite",        type: "ACTIVE",  baseDamage: 12, baseHealing: 0,  energyCost: 8,  cooldown: 1, petType: null },
      { name: "Growl",       type: "PASSIVE", baseDamage: 0,  baseHealing: 0,  energyCost: 0,  cooldown: 0, petType: null },
    ];
    for (const s of SKILLS) {
      await db.insert(petSkills).values({
        name: s.name, type: s.type, baseDamage: s.baseDamage,
        baseHealing: s.baseHealing, energyCost: s.energyCost,
        cooldown: s.cooldown, petType: s.petType as never,
      }).onConflictDoNothing();
    }
  }

  async seedRoutes(): Promise<void> {
    // No-op for pets (routes are for mounts)
  }
}
