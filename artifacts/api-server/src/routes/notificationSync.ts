import { Router, type IRouter } from "express";
import {
  handleSync,
  handleGetCenter,
  handleGetFeed,
  handleGetState,
  handleMarkRead,
  handleMarkAllRead,
} from "../controllers/notificationSyncController.js";

const router: IRouter = Router();

router.post("/notifications/sync",         handleSync);
router.get("/notifications/center",        handleGetCenter);
router.get("/notifications/feed",          handleGetFeed);
router.get("/notifications/state",         handleGetState);
router.patch("/notifications/read-all",    handleMarkAllRead);
router.patch("/notifications/:id/read",    handleMarkRead);

export default router;
