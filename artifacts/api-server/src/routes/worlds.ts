import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleListWorlds,
  handleCreateWorld,
  handleGetWorld,
  handleUpdateWorld,
  handleDeleteWorld,
  handleFeaturedWorlds,
  handlePopularWorlds,
  handleRecentWorlds,
  handleSearchWorlds,
  handleAddBookmark,
  handleRemoveBookmark,
  handleListBookmarks,
  handleJoinWorld,
  handleLeaveWorld,
  handleTravelToWorld,
  handleListMembers,
  handleGetPresence,
  handleListWorldEvents,
  handleCreateWorldEvent,
  handleDashboard,
  handleTravelHistory,
} from "../controllers/worldController.js";

const router: IRouter = Router();

// ── Discovery ─────────────────────────────────────────────────────────────────
router.get("/worlds",                                   handleListWorlds);
router.get("/worlds/featured",                          handleFeaturedWorlds);
router.get("/worlds/popular",                           handlePopularWorlds);
router.get("/worlds/recent",                            handleRecentWorlds);
router.get("/worlds/search",                            handleSearchWorlds);
router.get("/worlds/bookmarks",      requireAuth,       handleListBookmarks);
router.get("/worlds/travel-history", requireAuth,       handleTravelHistory);
router.get("/worlds/dashboard",      requireAuth,       handleDashboard);

// ── World CRUD ────────────────────────────────────────────────────────────────
router.post("/worlds",               requireAuth,       handleCreateWorld);
router.get("/worlds/:id",                               handleGetWorld);
router.put("/worlds/:id",            requireAuth,       handleUpdateWorld);
router.delete("/worlds/:id",         requireAuth,       handleDeleteWorld);

// ── Bookmark ──────────────────────────────────────────────────────────────────
router.post("/worlds/:id/bookmark",  requireAuth,       handleAddBookmark);
router.delete("/worlds/:id/bookmark",requireAuth,       handleRemoveBookmark);

// ── Join / Leave / Travel ─────────────────────────────────────────────────────
router.post("/worlds/:id/join",      requireAuth,       handleJoinWorld);
router.post("/worlds/:id/leave",     requireAuth,       handleLeaveWorld);
router.post("/worlds/:id/travel",    requireAuth,       handleTravelToWorld);

// ── Members / Presence ────────────────────────────────────────────────────────
router.get("/worlds/:id/members",                       handleListMembers);
router.get("/worlds/:id/presence",                      handleGetPresence);

// ── Events ────────────────────────────────────────────────────────────────────
router.get("/worlds/:id/events",                        handleListWorldEvents);
router.post("/worlds/:id/events",    requireAuth,       handleCreateWorldEvent);

export default router;
