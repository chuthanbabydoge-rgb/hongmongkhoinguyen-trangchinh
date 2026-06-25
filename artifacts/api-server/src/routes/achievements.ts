import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  handleGetAllAchievements,
  handleGetMyAchievements,
} from "../controllers/achievementsController";

const router: IRouter = Router();

router.get("/achievements",     handleGetAllAchievements);
router.get("/achievements/me",  requireAuth, handleGetMyAchievements);

export default router;
