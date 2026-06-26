import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleListDungeons, handleGetDungeon,
  handleCreateDungeonInstance, handleGetDungeonInstance, handleListDungeonInstances,
  handleJoinDungeon, handleLeaveDungeon, handleStartDungeon,
  handleSpawnMonster, handleSpawnBoss, handleKillBoss,
  handleFinishDungeon, handleReviveMember,
  handleDungeonHistory, handleDungeonStatistics,
  handleListRaidBosses, handleListRaids, handleCreateRaid, handleGetRaid,
  handleJoinRaid, handleStartRaid, handleRaidDamage, handleFinishRaid,
  handleRaidLeaderboard, handleRaidHistory,
  handleListRaidGroups, handleCreateRaidGroup, handleJoinRaidGroup,
  handleLeaveRaidGroup, handleGetRaidGroupMembers,
} from "../controllers/dungeonController.js";

const router: IRouter = Router();

// ─── Dungeon definitions ──────────────────────────────────────────────────────
router.get ("/dungeons",                        handleListDungeons);
router.get ("/dungeons/history",                requireAuth, handleDungeonHistory);
router.get ("/dungeons/statistics",             requireAuth, handleDungeonStatistics);

// ─── Dungeon instances ────────────────────────────────────────────────────────
router.get ("/dungeons/instances",              handleListDungeonInstances);
router.post("/dungeons",                        requireAuth, handleCreateDungeonInstance);
router.get ("/dungeons/:id",                    handleGetDungeonInstance);
router.post("/dungeons/:id/join",               requireAuth, handleJoinDungeon);
router.post("/dungeons/:id/leave",              requireAuth, handleLeaveDungeon);
router.post("/dungeons/:id/start",              requireAuth, handleStartDungeon);
router.post("/dungeons/:id/spawn-monster",      requireAuth, handleSpawnMonster);
router.post("/dungeons/:id/spawn-boss",         requireAuth, handleSpawnBoss);
router.post("/dungeons/:id/kill-boss",          requireAuth, handleKillBoss);
router.post("/dungeons/:id/finish",             requireAuth, handleFinishDungeon);
router.post("/dungeons/:id/revive",             requireAuth, handleReviveMember);

// ─── Raid definitions & instances ────────────────────────────────────────────
router.get ("/raids/bosses",                    handleListRaidBosses);
router.get ("/raids/leaderboard",               handleRaidLeaderboard);
router.get ("/raids/history",                   requireAuth, handleRaidHistory);
router.get ("/raids",                           handleListRaids);
router.post("/raids",                           requireAuth, handleCreateRaid);
router.get ("/raids/:id",                       handleGetRaid);
router.post("/raids/:id/join",                  requireAuth, handleJoinRaid);
router.post("/raids/:id/start",                 requireAuth, handleStartRaid);
router.post("/raids/:id/damage",                requireAuth, handleRaidDamage);
router.post("/raids/:id/finish",                requireAuth, handleFinishRaid);

// ─── Raid groups ──────────────────────────────────────────────────────────────
router.get ("/raid-groups",                     handleListRaidGroups);
router.post("/raid-groups",                     requireAuth, handleCreateRaidGroup);
router.get ("/raid-groups/:id/members",         handleGetRaidGroupMembers);
router.post("/raid-groups/:id/join",            requireAuth, handleJoinRaidGroup);
router.post("/raid-groups/:id/leave",           requireAuth, handleLeaveRaidGroup);

export default router;
