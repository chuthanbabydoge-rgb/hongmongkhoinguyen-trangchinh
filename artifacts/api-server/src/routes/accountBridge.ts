import { Router, type IRouter } from "express";
import {
  handleGetHubMe,
  handleGetHubDashboard,
  handleGetAccountHealth,
} from "../controllers/accountBridgeController.js";

const router: IRouter = Router();

router.get("/hub/me",             handleGetHubMe);
router.get("/hub/dashboard",      handleGetHubDashboard);
router.get("/hub/account-health", handleGetAccountHealth);

export default router;
