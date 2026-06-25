import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleCreateGuild,
  handleListGuilds,
  handleGetGuild,
  handleUpdateGuild,
  handleDeleteGuild,
  handleGetMembers,
  handleInvite,
  handleJoinRequest,
  handleApproveJoin,
  handleRejectJoin,
  handleLeave,
  handleKick,
  handleChangeRole,
  handlePostAnnouncement,
  handleGetAnnouncements,
  handleContribute,
  handleGetContributions,
  handleWithdrawTreasury,
  handleGetTreasuryTransactions,
  handleGetWarehouse,
  handleWithdrawWarehouse,
  handleCreateEvent,
  handleGetEvents,
  handleJoinEvent,
  handleGetLogs,
  handleGetMyGuild,
  handleGetLeaderboard,
} from "../controllers/guildController.js";

const router: IRouter = Router();

// ── Guild CRUD ─────────────────────────────────────────────────────────────────
router.post("/guilds",              requireAuth, handleCreateGuild);
router.get("/guilds",                           handleListGuilds);
router.get("/guilds/leaderboard",               handleGetLeaderboard);
router.get("/guilds/me",            requireAuth, handleGetMyGuild);
router.get("/guilds/:id",                       handleGetGuild);
router.put("/guilds/:id",           requireAuth, handleUpdateGuild);
router.delete("/guilds/:id",        requireAuth, handleDeleteGuild);

// ── Members ────────────────────────────────────────────────────────────────────
router.get("/guilds/:id/members",               handleGetMembers);
router.post("/guilds/:id/invite",   requireAuth, handleInvite);
router.post("/guilds/:id/join",     requireAuth, handleJoinRequest);
router.post("/guilds/:id/approve",  requireAuth, handleApproveJoin);
router.post("/guilds/:id/reject",   requireAuth, handleRejectJoin);
router.post("/guilds/:id/leave",    requireAuth, handleLeave);
router.post("/guilds/:id/kick",     requireAuth, handleKick);
router.put("/guilds/:id/member/:userId/role", requireAuth, handleChangeRole);

// ── Announcements ──────────────────────────────────────────────────────────────
router.post("/guilds/:id/announcement", requireAuth, handlePostAnnouncement);
router.get("/guilds/:id/announcement",             handleGetAnnouncements);

// ── Contributions ──────────────────────────────────────────────────────────────
router.post("/guilds/:id/contribute",  requireAuth, handleContribute);
router.get("/guilds/:id/contributions",             handleGetContributions);

// ── Treasury ───────────────────────────────────────────────────────────────────
router.post("/guilds/:id/treasury/withdraw", requireAuth, handleWithdrawTreasury);
router.get("/guilds/:id/treasury",                        handleGetTreasuryTransactions);

// ── Warehouse ──────────────────────────────────────────────────────────────────
router.get("/guilds/:id/warehouse",                         handleGetWarehouse);
router.post("/guilds/:id/warehouse/withdraw", requireAuth,  handleWithdrawWarehouse);

// ── Events ─────────────────────────────────────────────────────────────────────
router.post("/guilds/:id/events",                    requireAuth, handleCreateEvent);
router.get("/guilds/:id/events",                                  handleGetEvents);
router.post("/guilds/:id/events/:eventId/join",      requireAuth, handleJoinEvent);

// ── Logs ───────────────────────────────────────────────────────────────────────
router.get("/guilds/:id/logs", requireAuth, handleGetLogs);

export default router;
