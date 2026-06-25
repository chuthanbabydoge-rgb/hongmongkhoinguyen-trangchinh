import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleSendFriendRequest,
  handleAcceptFriendRequest,
  handleDeclineFriendRequest,
  handleGetFriends,
  handleGetPendingRequests,
  handleGetSentRequests,
  handleFollowUser,
  handleUnfollowUser,
  handleGetFollowers,
  handleGetFollowing,
  handleGetMyProfile,
  handleGetPublicProfile,
  handleSearchUsers,
  handleSetPresence,
  handleGetPresence,
  handleGetSocialCounts,
} from "../controllers/socialController.js";

const router: IRouter = Router();

// ── Friend requests ────────────────────────────────────────────────────────────
router.post("/social/friends/request",   requireAuth, handleSendFriendRequest);
router.post("/social/friends/:id/accept",  requireAuth, handleAcceptFriendRequest);
router.post("/social/friends/:id/decline", requireAuth, handleDeclineFriendRequest);
router.get("/social/friends",            requireAuth, handleGetFriends);
router.get("/social/friends/pending",    requireAuth, handleGetPendingRequests);
router.get("/social/friends/sent",       requireAuth, handleGetSentRequests);

// ── Follow system ──────────────────────────────────────────────────────────────
router.post("/social/follow/:userId",   requireAuth, handleFollowUser);
router.delete("/social/follow/:userId", requireAuth, handleUnfollowUser);
router.get("/social/followers",         requireAuth, handleGetFollowers);
router.get("/social/following",         requireAuth, handleGetFollowing);

// ── Profiles ───────────────────────────────────────────────────────────────────
router.get("/social/profile/me",         requireAuth, handleGetMyProfile);
router.get("/social/profile/:userId",               handleGetPublicProfile);

// ── Search ─────────────────────────────────────────────────────────────────────
router.get("/social/search", requireAuth, handleSearchUsers);

// ── Presence ───────────────────────────────────────────────────────────────────
router.post("/social/presence",         requireAuth, handleSetPresence);
router.get("/social/presence/:userId",              handleGetPresence);

// ── Counts (dashboard widget) ──────────────────────────────────────────────────
router.get("/social/counts",            requireAuth, handleGetSocialCounts);

export default router;
