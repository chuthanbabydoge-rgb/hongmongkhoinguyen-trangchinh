import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  handleGetNotifications,
  handleCreateNotification,
  handleMarkRead,
  handleMarkAllRead,
  handleDeleteNotification,
} from "../controllers/notificationsController";

const router: IRouter = Router();

// GET  /api/notifications?type=reward&unread=true
// POST /api/notifications
// PATCH /api/notifications/read-all
// PATCH /api/notifications/:id/read
// DELETE /api/notifications/:id
router.get("/notifications",              requireAuth, handleGetNotifications);
router.post("/notifications",             requireAuth, handleCreateNotification);
router.patch("/notifications/read-all",   requireAuth, handleMarkAllRead);
router.patch("/notifications/:id/read",   requireAuth, handleMarkRead);
router.delete("/notifications/:id",       requireAuth, handleDeleteNotification);

export default router;
