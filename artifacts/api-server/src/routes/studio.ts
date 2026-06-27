// ─────────────────────────────────────────────────────────────────────────────
// Creator Studio routes — HUB-30
// /api/studio/*  (80+ endpoints)
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleStudioDashboard,
  handleListEditors, handleGetEditor, handleCreateEditor, handleUpdateEditor, handleDeleteEditor,
  handleOpenEditor, handleCloseEditor,
  handleListSessions, handleCreateSession, handleEndSession,
  handleListLayouts, handleCreateLayout, handleUpdateLayout, handleDeleteLayout, handleSetDefaultLayout,
  handleGetPreferences, handleUpdatePreferences,
  handleListDocs, handleGetDoc, handleCreateDoc, handleUpdateDoc, handleDeleteDoc,
  handleSaveDoc, handleUndoDoc, handleRedoDoc, handleCloneDoc, handlePublishDoc,
  handleListScripts, handleGetScript, handleCreateScript, handleUpdateScript, handleDeleteScript, handleSaveScript,
  handleListTrees, handleGetTree, handleCreateTree, handleUpdateTree, handleDeleteTree,
  handleListGraphs, handleGetGraph, handleCreateGraph, handleUpdateGraph, handleDeleteGraph,
  handleListJobs, handleGetJob, handleRetryJob, handleDeleteJob,
  handleListAssets, handleGetAsset, handleCreateAsset, handleDeleteAsset,
  handleListPackages, handleListPublicPackages, handleGetPackage, handleCreatePackage,
  handleUpdatePackage, handleDeletePackage, handleInstallPackage,
  handleListPlugins, handleGetPlugin, handleCreatePlugin, handleUpdatePlugin, handleDeletePlugin,
  handleEnablePlugin, handleDisablePlugin,
  handleListTemplates, handleGetTemplate, handleCreateTemplate, handleUpdateTemplate, handleDeleteTemplate, handleUseTemplate,
  handleListHistory, handleListDocHistory, handleDeleteHistory,
  handleListBackups, handleGetBackup, handleCreateBackup, handleDeleteBackup, handleRestoreBackup,
  handleImport, handleExport,
} from "../controllers/creatorStudioController.js";

const router: IRouter = Router();

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/studio/dashboard",                  requireAuth, handleStudioDashboard);

// ── Editors ───────────────────────────────────────────────────────────────────
router.get("/studio/editors",                    requireAuth, handleListEditors);
router.post("/studio/editors",                   requireAuth, handleCreateEditor);
router.get("/studio/editors/:id",                requireAuth, handleGetEditor);
router.put("/studio/editors/:id",                requireAuth, handleUpdateEditor);
router.delete("/studio/editors/:id",             requireAuth, handleDeleteEditor);
router.post("/studio/editors/:id/open",          requireAuth, handleOpenEditor);
router.post("/studio/editors/:id/close",         requireAuth, handleCloseEditor);

// ── Sessions ──────────────────────────────────────────────────────────────────
router.get("/studio/sessions",                   requireAuth, handleListSessions);
router.post("/studio/sessions",                  requireAuth, handleCreateSession);
router.put("/studio/sessions/:id/end",           requireAuth, handleEndSession);

// ── Layouts ───────────────────────────────────────────────────────────────────
router.get("/studio/layouts",                    requireAuth, handleListLayouts);
router.post("/studio/layouts",                   requireAuth, handleCreateLayout);
router.put("/studio/layouts/:id",                requireAuth, handleUpdateLayout);
router.delete("/studio/layouts/:id",             requireAuth, handleDeleteLayout);
router.post("/studio/layouts/:id/default",       requireAuth, handleSetDefaultLayout);

// ── Preferences ───────────────────────────────────────────────────────────────
router.get("/studio/preferences",                requireAuth, handleGetPreferences);
router.put("/studio/preferences",                requireAuth, handleUpdatePreferences);

// ── Documents (generic by :type) ──────────────────────────────────────────────
router.get("/studio/docs/:type",                 requireAuth, handleListDocs);
router.post("/studio/docs/:type",                requireAuth, handleCreateDoc);
router.get("/studio/docs/:type/:id",             requireAuth, handleGetDoc);
router.put("/studio/docs/:type/:id",             requireAuth, handleUpdateDoc);
router.delete("/studio/docs/:type/:id",          requireAuth, handleDeleteDoc);
router.post("/studio/docs/:type/:id/save",       requireAuth, handleSaveDoc);
router.post("/studio/docs/:type/:id/undo",       requireAuth, handleUndoDoc);
router.post("/studio/docs/:type/:id/redo",       requireAuth, handleRedoDoc);
router.post("/studio/docs/:type/:id/clone",      requireAuth, handleCloneDoc);
router.post("/studio/docs/:type/:id/publish",    requireAuth, handlePublishDoc);

// ── Visual Scripts ────────────────────────────────────────────────────────────
router.get("/studio/scripts",                    requireAuth, handleListScripts);
router.post("/studio/scripts",                   requireAuth, handleCreateScript);
router.get("/studio/scripts/:id",                requireAuth, handleGetScript);
router.put("/studio/scripts/:id",                requireAuth, handleUpdateScript);
router.delete("/studio/scripts/:id",             requireAuth, handleDeleteScript);
router.post("/studio/scripts/:id/save",          requireAuth, handleSaveScript);

// ── Behavior Trees ────────────────────────────────────────────────────────────
router.get("/studio/trees",                      requireAuth, handleListTrees);
router.post("/studio/trees",                     requireAuth, handleCreateTree);
router.get("/studio/trees/:id",                  requireAuth, handleGetTree);
router.put("/studio/trees/:id",                  requireAuth, handleUpdateTree);
router.delete("/studio/trees/:id",               requireAuth, handleDeleteTree);

// ── Logic Graphs ──────────────────────────────────────────────────────────────
router.get("/studio/graphs",                     requireAuth, handleListGraphs);
router.post("/studio/graphs",                    requireAuth, handleCreateGraph);
router.get("/studio/graphs/:id",                 requireAuth, handleGetGraph);
router.put("/studio/graphs/:id",                 requireAuth, handleUpdateGraph);
router.delete("/studio/graphs/:id",              requireAuth, handleDeleteGraph);

// ── Publish Jobs ──────────────────────────────────────────────────────────────
router.get("/studio/publish/jobs",               requireAuth, handleListJobs);
router.get("/studio/publish/jobs/:id",           requireAuth, handleGetJob);
router.post("/studio/publish/jobs/:id/retry",    requireAuth, handleRetryJob);
router.delete("/studio/publish/jobs/:id",        requireAuth, handleDeleteJob);

// ── Assets ────────────────────────────────────────────────────────────────────
router.get("/studio/assets",                     requireAuth, handleListAssets);
router.post("/studio/assets",                    requireAuth, handleCreateAsset);
router.get("/studio/assets/:id",                 requireAuth, handleGetAsset);
router.delete("/studio/assets/:id",              requireAuth, handleDeleteAsset);

// ── Packages ──────────────────────────────────────────────────────────────────
router.get("/studio/packages/public",            handleListPublicPackages);
router.get("/studio/packages",                   requireAuth, handleListPackages);
router.post("/studio/packages",                  requireAuth, handleCreatePackage);
router.get("/studio/packages/:id",               handleGetPackage);
router.put("/studio/packages/:id",               requireAuth, handleUpdatePackage);
router.delete("/studio/packages/:id",            requireAuth, handleDeletePackage);
router.post("/studio/packages/:id/install",      requireAuth, handleInstallPackage);

// ── Plugins ───────────────────────────────────────────────────────────────────
router.get("/studio/plugins",                    requireAuth, handleListPlugins);
router.post("/studio/plugins",                   requireAuth, handleCreatePlugin);
router.get("/studio/plugins/:id",                requireAuth, handleGetPlugin);
router.put("/studio/plugins/:id",                requireAuth, handleUpdatePlugin);
router.delete("/studio/plugins/:id",             requireAuth, handleDeletePlugin);
router.post("/studio/plugins/:id/enable",        requireAuth, handleEnablePlugin);
router.post("/studio/plugins/:id/disable",       requireAuth, handleDisablePlugin);

// ── Templates ─────────────────────────────────────────────────────────────────
router.get("/studio/templates",                  handleListTemplates);
router.post("/studio/templates",                 requireAuth, handleCreateTemplate);
router.get("/studio/templates/:id",              handleGetTemplate);
router.put("/studio/templates/:id",              requireAuth, handleUpdateTemplate);
router.delete("/studio/templates/:id",           requireAuth, handleDeleteTemplate);
router.post("/studio/templates/:id/use",         requireAuth, handleUseTemplate);

// ── History ───────────────────────────────────────────────────────────────────
router.get("/studio/history",                    requireAuth, handleListHistory);
router.get("/studio/history/:docId",             requireAuth, handleListDocHistory);
router.delete("/studio/history/:id",             requireAuth, handleDeleteHistory);

// ── Backups ───────────────────────────────────────────────────────────────────
router.get("/studio/backups",                    requireAuth, handleListBackups);
router.post("/studio/backups",                   requireAuth, handleCreateBackup);
router.get("/studio/backups/:id",                requireAuth, handleGetBackup);
router.delete("/studio/backups/:id",             requireAuth, handleDeleteBackup);
router.post("/studio/backups/:id/restore",       requireAuth, handleRestoreBackup);

// ── Import / Export ───────────────────────────────────────────────────────────
router.post("/studio/import",                    requireAuth, handleImport);
router.get("/studio/export",                     requireAuth, handleExport);

export default router;
