// ─────────────────────────────────────────────────────────────────────────────
// Creator routes — HUB-24
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleCreatorDashboard,
  handleListProjects,
  handleListPublicProjects,
  handleGetFavorites,
  handleGetTemplates,
  handleGetProject,
  handleCreateProject,
  handleUpdateProject,
  handleDeleteProject,
  handlePublishProject,
  handleForkProject,
  handleSaveVersion,
  handleRestoreVersion,
  handleGetVersions,
  handleFavorite,
  handleUnfavorite,
  handleAddMember,
  handleRemoveMember,
  handleGetMembers,
  handleAddComment,
  handleGetComments,
  handleUploadAsset,
  handleGetAssets,
} from "../controllers/creatorController.js";

const router: IRouter = Router();

// Dashboard
router.get("/creator/dashboard",            requireAuth, handleCreatorDashboard);

// Projects
router.get("/creator/projects",             requireAuth, handleListProjects);
router.get("/creator/projects/public",      handleListPublicProjects);
router.get("/creator/projects/templates",   handleGetTemplates);
router.get("/creator/projects/favorites",   requireAuth, handleGetFavorites);
router.get("/creator/projects/:id",         handleGetProject);
router.post("/creator/projects",            requireAuth, handleCreateProject);
router.put("/creator/projects/:id",         requireAuth, handleUpdateProject);
router.delete("/creator/projects/:id",      requireAuth, handleDeleteProject);

// Project actions
router.post("/creator/projects/:id/publish",  requireAuth, handlePublishProject);
router.post("/creator/projects/:id/fork",     requireAuth, handleForkProject);
router.post("/creator/projects/:id/version",  requireAuth, handleSaveVersion);
router.post("/creator/projects/:id/restore",  requireAuth, handleRestoreVersion);
router.get("/creator/projects/:id/versions",  handleGetVersions);

// Favorites
router.post("/creator/projects/:id/favorite",   requireAuth, handleFavorite);
router.delete("/creator/projects/:id/favorite", requireAuth, handleUnfavorite);

// Members
router.get("/creator/projects/:id/members",    handleGetMembers);
router.post("/creator/projects/:id/member",    requireAuth, handleAddMember);
router.delete("/creator/projects/:id/member",  requireAuth, handleRemoveMember);

// Comments
router.get("/creator/projects/:id/comments",  handleGetComments);
router.post("/creator/projects/:id/comment",  requireAuth, handleAddComment);

// Assets
router.post("/creator/assets",   requireAuth, handleUploadAsset);
router.get("/creator/assets",    requireAuth, handleGetAssets);

export default router;
