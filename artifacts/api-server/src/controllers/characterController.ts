// ─────────────────────────────────────────────────────────────────────────────
// characterController — HUB-18
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { characterService, accountBridgeService } from "../container.js";
import { CharacterError } from "../services/characterService.js";
import type { EquipmentSlot } from "../repositories/characterRepository.js";

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
  if (err instanceof CharacterError) {
    res.status(err.status).json({ ok: false, code: err.code, error: err.message });
    return;
  }
  res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
}

// GET /api/characters/me
export async function handleGetMyCharacter(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const character = await characterService.getMyCharacter(userId);
    res.json({ ok: true, data: character });
  } catch (err) { handleError(err, res); }
}

// POST /api/characters
export async function handleCreateCharacter(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { name, class: cls, race, faction } = req.body as Record<string, string>;
    if (!name) { res.status(400).json({ ok: false, error: "name là bắt buộc" }); return; }
    const character = await characterService.createCharacter(userId, { name, class: cls as never, race: race as never, faction });
    res.status(201).json({ ok: true, data: character });
  } catch (err) { handleError(err, res); }
}

// PUT /api/characters/me
export async function handleUpdateCharacter(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const character = await characterService.updateCharacter(userId, req.body as never);
    res.json({ ok: true, data: character });
  } catch (err) { handleError(err, res); }
}

// DELETE /api/characters/me
export async function handleDeleteCharacter(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    await characterService.deleteCharacter(userId);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// GET /api/characters/stats
export async function handleGetStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const stats = await characterService.getStats(userId);
    res.json({ ok: true, data: stats });
  } catch (err) { handleError(err, res); }
}

// POST /api/characters/xp
export async function handleGainXP(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { amount, source, sourceId } = req.body as { amount?: number; source?: string; sourceId?: string };
    if (!amount || !source) { res.status(400).json({ ok: false, error: "amount và source là bắt buộc" }); return; }
    const result = await characterService.gainExperience(userId, amount, source, sourceId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// POST /api/characters/equip
export async function handleEquipItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { slot, itemId, itemName, itemIcon, itemRarity, statBonus } = req.body as Record<string, unknown>;
    if (!slot || !itemId || !itemName) { res.status(400).json({ ok: false, error: "slot, itemId, itemName là bắt buộc" }); return; }
    const item = await characterService.equipItem(userId, { slot: slot as EquipmentSlot, itemId: itemId as string, itemName: itemName as string, itemIcon: itemIcon as string | undefined, itemRarity: itemRarity as string | undefined, statBonus: statBonus as Record<string, number> | undefined });
    res.json({ ok: true, data: item });
  } catch (err) { handleError(err, res); }
}

// POST /api/characters/unequip
export async function handleUnequipItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { slot } = req.body as { slot?: string };
    if (!slot) { res.status(400).json({ ok: false, error: "slot là bắt buộc" }); return; }
    await characterService.unequipItem(userId, slot as EquipmentSlot);
    res.json({ ok: true });
  } catch (err) { handleError(err, res); }
}

// GET /api/characters/skills
export async function handleGetSkillTree(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const skills = await characterService.getSkillTree(userId);
    res.json({ ok: true, data: skills });
  } catch (err) { handleError(err, res); }
}

// POST /api/characters/skills/:id
export async function handleLearnSkill(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const skillId = req.params["id"] as string;
    const { upgrade } = req.body as { upgrade?: boolean };
    const result = upgrade
      ? await characterService.upgradeSkill(userId, skillId)
      : await characterService.learnSkill(userId, skillId);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// GET /api/characters/titles
export async function handleGetTitles(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const titles = await characterService.getTitles(userId);
    res.json({ ok: true, data: titles });
  } catch (err) { handleError(err, res); }
}

// POST /api/characters/titles/:id/select
export async function handleSelectTitle(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const result = await characterService.selectTitle(userId, req.params["id"] as string);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// GET /api/characters/presets
export async function handleGetPresets(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const presets = await characterService.getPresets(userId);
    res.json({ ok: true, data: presets });
  } catch (err) { handleError(err, res); }
}

// POST /api/characters/presets
export async function handleSavePreset(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const { name, presetId } = req.body as { name?: string; presetId?: string };
    if (presetId) {
      const preset = await characterService.loadPreset(userId, presetId);
      res.json({ ok: true, data: preset });
      return;
    }
    if (!name) { res.status(400).json({ ok: false, error: "name là bắt buộc" }); return; }
    const preset = await characterService.savePreset(userId, name);
    res.status(201).json({ ok: true, data: preset });
  } catch (err) { handleError(err, res); }
}

// GET /api/characters/appearance
export async function handleGetAppearance(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const customization = await characterService.getCustomization(userId);
    res.json({ ok: true, data: customization });
  } catch (err) { handleError(err, res); }
}

// PUT /api/characters/appearance
export async function handleUpdateAppearance(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const result = await characterService.updateAppearance(userId, req.body as never);
    res.json({ ok: true, data: result });
  } catch (err) { handleError(err, res); }
}

// GET /api/characters/xp/logs
export async function handleGetXPLogs(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const logs = await characterService.getExperienceLogs(userId);
    res.json({ ok: true, data: logs });
  } catch (err) { handleError(err, res); }
}

// GET /api/characters/equipment
export async function handleGetEquipment(req: Request, res: Response): Promise<void> {
  try {
    const userId = await resolveUserId(req);
    if (!requireUser(userId, res)) return;
    const equipment = await characterService.getEquipment(userId);
    res.json({ ok: true, data: equipment });
  } catch (err) { handleError(err, res); }
}
