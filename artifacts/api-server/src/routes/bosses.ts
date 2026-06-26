import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleListBosses, handleGetActiveBosses, handleGetBoss,
  handleSpawnBoss, handleJoinBoss, handleAttackBoss, handleCastSkill,
  handleGetBossLeaderboard, handleGetBossSkills, handleGetBossParticipants,
  handleBossHistory, handleBossStatistics, handleThreatTable,
  handleListWorldEvents, handleGetWorldEvent, handleCreateWorldEvent,
  handleJoinWorldEvent, handleStartWorldEvent, handleContributeObjective,
  handleCompleteWorldEvent, handleWorldEventHistory,
  handleGetWeather, handleListWeather, handleSetWeather,
} from "../controllers/bossController.js";

const router: IRouter = Router();

// ─── Boss definitions & combat ────────────────────────────────────────────────
router.get ("/bosses/active",               handleGetActiveBosses);
router.get ("/bosses/history",              requireAuth, handleBossHistory);
router.get ("/bosses/statistics",           requireAuth, handleBossStatistics);
router.get ("/bosses",                      handleListBosses);
router.get ("/bosses/:id",                  handleGetBoss);
router.post("/bosses/:id/spawn",            handleSpawnBoss);
router.post("/bosses/:id/join",             requireAuth, handleJoinBoss);
router.post("/bosses/:id/attack",           requireAuth, handleAttackBoss);
router.post("/bosses/:id/skill",            requireAuth, handleCastSkill);
router.get ("/bosses/:id/leaderboard",      handleGetBossLeaderboard);
router.get ("/bosses/:id/skills",           handleGetBossSkills);
router.get ("/bosses/:id/participants",     handleGetBossParticipants);
router.get ("/bosses/:id/threat",           handleThreatTable);

// ─── World Events ─────────────────────────────────────────────────────────────
router.get ("/world-events/history",        requireAuth, handleWorldEventHistory);
router.get ("/world-events",                handleListWorldEvents);
router.post("/world-events",                requireAuth, handleCreateWorldEvent);
router.get ("/world-events/:id",            handleGetWorldEvent);
router.post("/world-events/:id/join",       requireAuth, handleJoinWorldEvent);
router.post("/world-events/:id/start",      requireAuth, handleStartWorldEvent);
router.post("/world-events/:id/contribute", requireAuth, handleContributeObjective);
router.post("/world-events/:id/complete",   requireAuth, handleCompleteWorldEvent);

// ─── Weather ──────────────────────────────────────────────────────────────────
router.get ("/weather/all",                 handleListWeather);
router.get ("/weather",                     handleGetWeather);
router.post("/weather",                     requireAuth, handleSetWeather);

export default router;
