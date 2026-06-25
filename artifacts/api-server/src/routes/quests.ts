import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleGetQuests,
  handleGetDailyQuests,
  handleGetWeeklyQuests,
  handleGetMyQuests,
  handleGetCompletedQuests,
  handleGetQuestById,
  handleStartQuest,
  handleClaimQuest,
  handleCancelQuest,
  handleTrackEvent,
} from "../controllers/questController.js";

const router = Router();

router.get("/quests",           handleGetQuests);
router.get("/quests/daily",     handleGetDailyQuests);
router.get("/quests/weekly",    handleGetWeeklyQuests);
router.get("/quests/me",        requireAuth, handleGetMyQuests);
router.get("/quests/completed", requireAuth, handleGetCompletedQuests);
router.get("/quests/:id",       handleGetQuestById);

router.post("/quests/:id/start",  requireAuth, handleStartQuest);
router.post("/quests/:id/claim",  requireAuth, handleClaimQuest);
router.post("/quests/:id/cancel", requireAuth, handleCancelQuest);
router.post("/quests/track",      requireAuth, handleTrackEvent);

export default router;
