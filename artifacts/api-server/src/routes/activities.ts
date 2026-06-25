import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { handleGetActivities, handleCreateActivity } from "../controllers/activitiesController";

const router: IRouter = Router();

// GET  /api/activities?type=marketplace&limit=50
// POST /api/activities
router.get("/activities",  requireAuth, handleGetActivities);
router.post("/activities", requireAuth, handleCreateActivity);

export default router;
