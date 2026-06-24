import { Router, type IRouter } from "express";
import {
  handleGetHubMe,
  handleGetHubDashboard,
  handleGetAccountHealth,
} from "../controllers/accountBridgeController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router: IRouter = Router();

// HUB-5: /hub/me and /hub/dashboard require a valid Bearer token
router.get("/hub/me",             requireAuth, handleGetHubMe);
router.get("/hub/dashboard",      requireAuth, handleGetHubDashboard);
router.get("/hub/account-health", handleGetAccountHealth);

export default router;
