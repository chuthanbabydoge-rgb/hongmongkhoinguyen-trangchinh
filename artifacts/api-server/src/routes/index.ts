import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import walletRouter from "./wallet";
import inventoryRouter from "./inventory";
import marketplaceRouter from "./marketplace";
import notificationsRouter from "./notifications";
import accountBridgeRouter from "./accountBridge";
import ecosystemRouter from "./ecosystem";
import launcherRouter from "./launcher";
import notificationSyncRouter from "./notificationSync";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(walletRouter);
router.use(inventoryRouter);
router.use(marketplaceRouter);
router.use(notificationsRouter);
router.use(accountBridgeRouter);
router.use(ecosystemRouter);
router.use(launcherRouter);
router.use(notificationSyncRouter);

export default router;
