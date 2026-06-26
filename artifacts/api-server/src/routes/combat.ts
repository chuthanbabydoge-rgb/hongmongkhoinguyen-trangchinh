import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleListBattles, handleCreateBattle,
  handleGetBattle, handleJoinBattle, handleStartBattle,
  handleAttack, handleCastSkill, handleSurrender, handleFinishBattle,
  handleHistory, handleLeaderboard,
  handleListBosses, handleStartBossBattle,
  handleArena, handleArenaQueue,
  handleListSkills, handleStatistics,
} from "../controllers/combatController.js";

const router: IRouter = Router();

// ─── General ──────────────────────────────────────────────────────────────────
router.get   ("/combat",                      handleListBattles);
router.post  ("/combat",            requireAuth, handleCreateBattle);
router.get   ("/combat/history",    requireAuth, handleHistory);
router.get   ("/combat/leaderboard",            handleLeaderboard);
router.get   ("/combat/skills",                 handleListSkills);
router.get   ("/combat/statistics", requireAuth, handleStatistics);

// ─── Bosses ───────────────────────────────────────────────────────────────────
router.get   ("/combat/bosses",               handleListBosses);
router.post  ("/combat/bosses/:id/start", requireAuth, handleStartBossBattle);

// ─── Arena ────────────────────────────────────────────────────────────────────
router.get   ("/combat/arena",      requireAuth, handleArena);
router.post  ("/combat/arena/queue",requireAuth, handleArenaQueue);

// ─── Battle actions ───────────────────────────────────────────────────────────
router.get   ("/combat/:id",        handleGetBattle);
router.post  ("/combat/:id/join",   requireAuth, handleJoinBattle);
router.post  ("/combat/:id/start",  requireAuth, handleStartBattle);
router.post  ("/combat/:id/attack", requireAuth, handleAttack);
router.post  ("/combat/:id/skill",  requireAuth, handleCastSkill);
router.post  ("/combat/:id/surrender", requireAuth, handleSurrender);
router.post  ("/combat/:id/finish", requireAuth, handleFinishBattle);

export default router;
