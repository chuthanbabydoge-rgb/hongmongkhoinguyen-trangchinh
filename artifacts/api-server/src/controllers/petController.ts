// ─────────────────────────────────────────────────────────────────────────────
// petController — HUB-20
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { petService, mountService, accountBridgeService } from "../container.js";
import { PetError } from "../services/petService.js";
import { MountError } from "../services/mountService.js";

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return (profile as { userId?: string; id?: string }).userId
        || (profile as { userId?: string; id?: string }).id
        || null;
  } catch { return null; }
}

function requireUser(userId: string | null, res: Response): userId is string {
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return false; }
  return true;
}

function handleError(err: unknown, res: Response): void {
  if (err instanceof PetError || err instanceof MountError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// ─── Species ─────────────────────────────────────────────────────────────────

export async function handleListSpecies(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await petService.listSpecies() }); }
  catch (err) { handleError(err, res); }
}

// ─── Pet CRUD ─────────────────────────────────────────────────────────────────

export async function handleListPets(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.listPets(userId) });
  } catch (err) { handleError(err, res); }
}

export async function handleCreatePet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { speciesId, name, nickname } = req.body as Record<string, string>;
    if (!speciesId || !name) { res.status(400).json({ ok: false, error: "speciesId và name là bắt buộc" }); return; }
    const pet = await petService.createPet(userId, { speciesId, name, nickname });
    res.status(201).json({ ok: true, data: pet });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.getPet(req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

export async function handleDeletePet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json(await petService.deletePet(userId, req.params["id"] as string));
  } catch (err) { handleError(err, res); }
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function handleFeedPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { foodKey } = req.body as { foodKey?: string };
    res.json({ ok: true, data: await petService.feedPet(userId, req.params["id"] as string, foodKey) });
  } catch (err) { handleError(err, res); }
}

// ─── Train ────────────────────────────────────────────────────────────────────

export async function handleTrainPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { trainingType } = req.body as { trainingType?: string };
    res.json({ ok: true, data: await petService.trainPet(userId, req.params["id"] as string, trainingType) });
  } catch (err) { handleError(err, res); }
}

// ─── Evolve ───────────────────────────────────────────────────────────────────

export async function handleEvolvePet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.evolvePet(userId, req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

// ─── Equip / Unequip ──────────────────────────────────────────────────────────

export async function handleEquipPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { slot, itemId, itemName, itemIcon, itemRarity, statBonus } = req.body as Record<string, unknown>;
    if (!slot || !itemId || !itemName) { res.status(400).json({ ok: false, error: "slot, itemId, itemName là bắt buộc" }); return; }
    const eq = await petService.equipPet(userId, req.params["id"] as string, slot as string, itemId as string, itemName as string, itemIcon as string | undefined, itemRarity as string | undefined, statBonus as Record<string, number> | undefined);
    res.json({ ok: true, data: eq });
  } catch (err) { handleError(err, res); }
}

export async function handleUnequipPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { slot } = req.body as { slot?: string };
    if (!slot) { res.status(400).json({ ok: false, error: "slot là bắt buộc" }); return; }
    res.json(await petService.unequipPet(userId, req.params["id"] as string, slot));
  } catch (err) { handleError(err, res); }
}

export async function handleGetPetEquipment(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.getEquipment(req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function handleListPetSkills(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.query as { type?: string };
    res.json({ ok: true, data: await petService.listSkills(type as never) });
  } catch (err) { handleError(err, res); }
}

export async function handleLearnPetSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { skillId } = req.body as { skillId?: string };
    if (!skillId) { res.status(400).json({ ok: false, error: "skillId là bắt buộc" }); return; }
    res.json({ ok: true, data: await petService.learnSkill(userId, req.params["id"] as string, skillId) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPetSkills(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.getLearnedSkills(req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

// ─── Summon / Dismiss ─────────────────────────────────────────────────────────

export async function handleSummonPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.summonPet(userId, req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

export async function handleDismissPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.dismissPet(userId, req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetSummonedPet(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.getSummonedPet(userId) });
  } catch (err) { handleError(err, res); }
}

// ─── Bond & Logs ──────────────────────────────────────────────────────────────

export async function handleGetPetBond(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.getBond(req.params["id"] as string, userId) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetPetLogs(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await petService.getLogs(req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

// ─── Mount CRUD ───────────────────────────────────────────────────────────────

export async function handleListMountTypes(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await mountService.listMountTypes() }); }
  catch (err) { handleError(err, res); }
}

export async function handleListMounts(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await mountService.listMounts(userId) });
  } catch (err) { handleError(err, res); }
}

export async function handleCreateMount(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { typeId, name } = req.body as Record<string, string>;
    if (!typeId || !name) { res.status(400).json({ ok: false, error: "typeId và name là bắt buộc" }); return; }
    const mount = await mountService.createMount(userId, { typeId, name });
    res.status(201).json({ ok: true, data: mount });
  } catch (err) { handleError(err, res); }
}

export async function handleGetMount(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await mountService.getMount(req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

export async function handleTrainMount(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { trainingType } = req.body as { trainingType?: string };
    res.json({ ok: true, data: await mountService.trainMount(userId, req.params["id"] as string, trainingType) });
  } catch (err) { handleError(err, res); }
}

export async function handleEquipMount(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { slot, itemId, itemName, itemIcon, itemRarity, statBonus } = req.body as Record<string, unknown>;
    if (!slot || !itemId || !itemName) { res.status(400).json({ ok: false, error: "slot, itemId, itemName là bắt buộc" }); return; }
    const eq = await mountService.equipMount(userId, req.params["id"] as string, slot as string, itemId as string, itemName as string, itemIcon as string | undefined, itemRarity as string | undefined, statBonus as Record<string, number> | undefined);
    res.json({ ok: true, data: eq });
  } catch (err) { handleError(err, res); }
}

export async function handleTravelMount(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { routeId } = req.body as { routeId?: string };
    if (!routeId) { res.status(400).json({ ok: false, error: "routeId là bắt buộc" }); return; }
    res.json({ ok: true, data: await mountService.travel(userId, req.params["id"] as string, routeId) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetMountStatistics(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await mountService.getStatistics(userId) });
  } catch (err) { handleError(err, res); }
}

export async function handleListRoutes(req: Request, res: Response): Promise<void> {
  try { res.json({ ok: true, data: await mountService.listRoutes() }); }
  catch (err) { handleError(err, res); }
}

export async function handleGetMountCustomization(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await mountService.getCustomization(req.params["id"] as string) });
  } catch (err) { handleError(err, res); }
}

export async function handleUpdateMountCustomization(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await mountService.updateCustomization(userId, req.params["id"] as string, req.body as Record<string, unknown>) });
  } catch (err) { handleError(err, res); }
}

export async function handleGetTravelLogs(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    res.json({ ok: true, data: await mountService.getTravelLogs(userId) });
  } catch (err) { handleError(err, res); }
}
