import { Router, type IRouter } from "express";
import { handleLogin, handleRefresh, handleLogout } from "../controllers/authController.js";

const router: IRouter = Router();

router.post("/auth/login",   handleLogin);
router.post("/auth/refresh", handleRefresh);
router.post("/auth/logout",  handleLogout);

export default router;
