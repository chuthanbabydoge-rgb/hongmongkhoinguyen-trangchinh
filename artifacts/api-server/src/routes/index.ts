import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import walletRouter from "./wallet";
import inventoryRouter from "./inventory";
import marketplaceRouter from "./marketplace";
import notificationsRouter from "./notifications";
import activitiesRouter from "./activities";
import reputationRouter from "./reputation";
import achievementsRouter from "./achievements";
import accountBridgeRouter from "./accountBridge";
import ecosystemRouter from "./ecosystem";
import launcherRouter from "./launcher";
import notificationSyncRouter from "./notificationSync";
import appsRouter from "./apps";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(walletRouter);
router.use(inventoryRouter);
router.use(marketplaceRouter);
router.use(notificationsRouter);
router.use(activitiesRouter);
router.use(reputationRouter);
router.use(achievementsRouter);
router.use(accountBridgeRouter);
router.use(ecosystemRouter);
router.use(launcherRouter);
router.use(notificationSyncRouter);
router.use(appsRouter);

export default router;
