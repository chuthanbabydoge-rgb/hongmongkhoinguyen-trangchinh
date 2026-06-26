import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handlePvpDashboard, handleLeaderboard, handleMatchHistory,
  handleJoinQueue, handleLeaveQueue,
  handleGetMatch, handleReadyUp, handleAttack, handleSkill, handleSurrender,
  handleGetSeasons, handleGetCurrentSeason,
  handleListTournaments, handleCreateTournament, handleJoinTournament,
  handleGetBracket, handleStartTournament, handleFinishTournament,
} from "../controllers/pvpController.js";

const router: IRouter = Router();

// ─── PvP ─────────────────────────────────────────────────────────────────────
router.get ("/pvp/dashboard",              requireAuth, handlePvpDashboard);
router.get ("/pvp/leaderboard",            handleLeaderboard);
router.get ("/pvp/history",               requireAuth, handleMatchHistory);
router.post("/pvp/queue",                 requireAuth, handleJoinQueue);
router.delete("/pvp/queue",              requireAuth, handleLeaveQueue);
router.get ("/pvp/match/:id",             handleGetMatch);
router.post("/pvp/match/:id/ready",       requireAuth, handleReadyUp);
router.post("/pvp/match/:id/attack",      requireAuth, handleAttack);
router.post("/pvp/match/:id/skill",       requireAuth, handleSkill);
router.post("/pvp/match/:id/surrender",   requireAuth, handleSurrender);

// ─── Seasons ──────────────────────────────────────────────────────────────────
router.get ("/seasons",          handleGetSeasons);
router.get ("/seasons/current",  handleGetCurrentSeason);

// ─── Tournaments ──────────────────────────────────────────────────────────────
router.get ("/tournaments",              handleListTournaments);
router.post("/tournaments",              requireAuth, handleCreateTournament);
router.post("/tournaments/:id/join",     requireAuth, handleJoinTournament);
router.get ("/tournaments/:id/bracket",  handleGetBracket);
router.post("/tournaments/:id/start",    requireAuth, handleStartTournament);
router.post("/tournaments/:id/finish",   requireAuth, handleFinishTournament);

export default router;
