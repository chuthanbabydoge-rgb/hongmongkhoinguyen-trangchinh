import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  handleGetMyReputation,
  handleGetLeaderboard,
  handleGetHistory,
  handleAddEvent,
} from "../controllers/reputationController";

const router: IRouter = Router();

router.get("/reputation/me",          requireAuth, handleGetMyReputation);
router.get("/reputation/leaderboard",             handleGetLeaderboard);
router.get("/reputation/history",     requireAuth, handleGetHistory);
router.post("/reputation/event",      requireAuth, handleAddEvent);

export default router;
