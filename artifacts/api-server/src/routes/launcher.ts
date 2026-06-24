import { Router, type IRouter } from "express";
import {
  handleLaunchApp,
  handleGetRecentApps,
  handleGetFavoriteApps,
  handleGetDashboard,
  handleClearHistory,
} from "../controllers/appLauncherController.js";

const router: IRouter = Router();

router.post("/launcher/launch",      handleLaunchApp);
router.get("/launcher/recent",       handleGetRecentApps);
router.get("/launcher/favorites",    handleGetFavoriteApps);
router.get("/launcher/dashboard",    handleGetDashboard);
router.delete("/launcher/history",   handleClearHistory);

export default router;
