import { Router, type IRouter } from "express";
import { handleLogin, handleRefresh, handleLogout, handleSsoValidate } from "../controllers/authController.js";

const router: IRouter = Router();

// Hub chỉ proxy login/refresh/logout sang Universe Account.
// Đăng ký tài khoản thực hiện trực tiếp tại Universe Account project.
router.post("/auth/login",          handleLogin);
router.post("/auth/refresh",        handleRefresh);
router.post("/auth/logout",         handleLogout);
router.get("/auth/sso/validate",    handleSsoValidate);

export default router;
