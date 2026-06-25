import { Router, type IRouter } from "express";
import { handleLogin, handleRefresh, handleLogout, handleRegister, handleSsoValidate } from "../controllers/authController.js";

const router: IRouter = Router();

router.post("/auth/register",       handleRegister);
router.post("/auth/login",          handleLogin);
router.post("/auth/refresh",        handleRefresh);
router.post("/auth/logout",         handleLogout);
router.get("/auth/sso/validate",    handleSsoValidate);

export default router;
