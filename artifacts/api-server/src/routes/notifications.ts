import { Router, type IRouter } from "express";
import {
  handleGetNotifications,
} from "../controllers/notificationsController";

const router: IRouter = Router();

// GET /api/notifications?type=reward&unread=true
router.get("/notifications", handleGetNotifications);

export default router;
