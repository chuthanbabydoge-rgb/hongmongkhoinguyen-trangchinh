import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleGetMyCharacter, handleCreateCharacter, handleUpdateCharacter, handleDeleteCharacter,
  handleGetStats, handleGainXP,
  handleEquipItem, handleUnequipItem, handleGetEquipment,
  handleGetSkillTree, handleLearnSkill,
  handleGetTitles, handleSelectTitle,
  handleGetPresets, handleSavePreset,
  handleGetAppearance, handleUpdateAppearance,
  handleGetXPLogs,
} from "../controllers/characterController.js";

const router: IRouter = Router();

// ─── Character CRUD ───────────────────────────────────────────────────────────
router.get   ("/characters/me",           requireAuth, handleGetMyCharacter);
router.post  ("/characters",              requireAuth, handleCreateCharacter);
router.put   ("/characters/me",           requireAuth, handleUpdateCharacter);
router.delete("/characters/me",           requireAuth, handleDeleteCharacter);

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get   ("/characters/stats",        requireAuth, handleGetStats);

// ─── Experience ───────────────────────────────────────────────────────────────
router.post  ("/characters/xp",           requireAuth, handleGainXP);
router.get   ("/characters/xp/logs",      requireAuth, handleGetXPLogs);

// ─── Equipment ────────────────────────────────────────────────────────────────
router.get   ("/characters/equipment",    requireAuth, handleGetEquipment);
router.post  ("/characters/equip",        requireAuth, handleEquipItem);
router.post  ("/characters/unequip",      requireAuth, handleUnequipItem);

// ─── Skills ───────────────────────────────────────────────────────────────────
router.get   ("/characters/skills",       requireAuth, handleGetSkillTree);
router.post  ("/characters/skills/:id",   requireAuth, handleLearnSkill);

// ─── Titles ───────────────────────────────────────────────────────────────────
router.get   ("/characters/titles",       requireAuth, handleGetTitles);
router.post  ("/characters/titles/:id/select", requireAuth, handleSelectTitle);

// ─── Presets ──────────────────────────────────────────────────────────────────
router.get   ("/characters/presets",      requireAuth, handleGetPresets);
router.post  ("/characters/presets",      requireAuth, handleSavePreset);

// ─── Appearance ───────────────────────────────────────────────────────────────
router.get   ("/characters/appearance",   requireAuth, handleGetAppearance);
router.put   ("/characters/appearance",   requireAuth, handleUpdateAppearance);

export default router;
