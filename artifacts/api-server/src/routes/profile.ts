import { Router, type IRouter } from "express";
import {
  handleGetProfile,
} from "../controllers/profileController";

const router: IRouter = Router();

// GET /api/profile
// GET /api/profile/:userId  (future: when auth is added, derive userId from token)
router.get("/profile", handleGetProfile);
router.get("/profile/:userId", handleGetProfile);

export default router;
