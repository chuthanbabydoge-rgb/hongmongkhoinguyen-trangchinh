import type { Request, Response } from "express";
import { creatorStudioService } from "../container.js";
import { accountBridgeService } from "../container.js";
import type { StudioDocType } from "../repositories/drizzle/DrizzleCreatorStudioRepository.js";

const VALID_DOC_TYPES: StudioDocType[] = ["WORLD","NPC","QUEST","BOSS","DUNGEON","ITEM","SKILL","PET","MOUNT","BUILDING","CITY","SPORTS","EDUCATION","COMPANY","DIALOG"];

async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  try {
    const profile = await accountBridgeService.getProfileCached(auth);
    return (profile as unknown as Record<string, unknown>)?.["id"] as string ?? null;
  } catch { return null; }
}

function docType(req: Request): StudioDocType {
  const t = (req.params["type"] as string)?.toUpperCase() as StudioDocType;
  return VALID_DOC_TYPES.includes(t) ? t : "WORLD";
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function handleStudioDashboard(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const result = await creatorStudioService.getDashboard(userId);
  res.json(result);
}

// ── Editors ───────────────────────────────────────────────────────────────────
export async function handleListEditors(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listEditors(userId));
}
export async function handleGetEditor(req: Request, res: Response) {
  const result = await creatorStudioService.getEditor(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateEditor(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createEditor(userId, req.body as { name: string; description?: string }));
}
export async function handleUpdateEditor(req: Request, res: Response) {
  const result = await creatorStudioService.updateEditor(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteEditor(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteEditor(req.params["id"] as string));
}
export async function handleOpenEditor(req: Request, res: Response) {
  const { docId, docType: dt } = req.body as { docId: string; docType: string };
  res.json(await creatorStudioService.openEditor(req.params["id"] as string, docId, dt as StudioDocType));
}
export async function handleCloseEditor(req: Request, res: Response) {
  res.json(await creatorStudioService.closeEditor(req.params["id"] as string));
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export async function handleListSessions(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listSessions(userId));
}
export async function handleCreateSession(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createSession(userId, req.body as { editorId: string; docId?: string; docType?: string }));
}
export async function handleEndSession(req: Request, res: Response) {
  const result = await creatorStudioService.endSession(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}

// ── Layouts ───────────────────────────────────────────────────────────────────
export async function handleListLayouts(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listLayouts(userId));
}
export async function handleCreateLayout(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createLayout(userId, req.body as { name: string; layout: unknown }));
}
export async function handleUpdateLayout(req: Request, res: Response) {
  const result = await creatorStudioService.updateLayout(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteLayout(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteLayout(req.params["id"] as string));
}
export async function handleSetDefaultLayout(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.setDefaultLayout(userId, req.params["id"] as string));
}

// ── Preferences ───────────────────────────────────────────────────────────────
export async function handleGetPreferences(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.getPreferences(userId));
}
export async function handleUpdatePreferences(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.updatePreferences(userId, req.body as Record<string, unknown>));
}

// ── Documents ─────────────────────────────────────────────────────────────────
export async function handleListDocs(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listDocs(docType(req), userId));
}
export async function handleGetDoc(req: Request, res: Response) {
  const result = await creatorStudioService.getDoc(docType(req), req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateDoc(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createDoc(docType(req), userId, req.body as Record<string, unknown>));
}
export async function handleUpdateDoc(req: Request, res: Response) {
  const result = await creatorStudioService.updateDoc(docType(req), req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteDoc(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteDoc(docType(req), req.params["id"] as string));
}
export async function handleSaveDoc(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const result = await creatorStudioService.saveDoc(docType(req), req.params["id"] as string, userId, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleUndoDoc(req: Request, res: Response) {
  const result = await creatorStudioService.undoDoc(docType(req), req.params["id"] as string);
  res.status(result.ok ? 200 : 400).json(result);
}
export async function handleRedoDoc(req: Request, res: Response) {
  res.json(await creatorStudioService.redoDoc(docType(req), req.params["id"] as string));
}
export async function handleCloneDoc(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const result = await creatorStudioService.cloneDoc(docType(req), req.params["id"] as string, userId);
  res.status(result.ok ? 201 : 404).json(result);
}
export async function handlePublishDoc(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const result = await creatorStudioService.publishDoc(docType(req), req.params["id"] as string, userId);
  res.status(result.ok ? 200 : 404).json(result);
}

// ── Visual Scripts ────────────────────────────────────────────────────────────
export async function handleListScripts(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listScripts(userId));
}
export async function handleGetScript(req: Request, res: Response) {
  const result = await creatorStudioService.getScript(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateScript(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createScript(userId, req.body as { name: string }));
}
export async function handleUpdateScript(req: Request, res: Response) {
  const result = await creatorStudioService.updateScript(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteScript(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteScript(req.params["id"] as string));
}
export async function handleSaveScript(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const result = await creatorStudioService.saveScript(req.params["id"] as string, userId, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}

// ── Behavior Trees ────────────────────────────────────────────────────────────
export async function handleListTrees(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listTrees(userId));
}
export async function handleGetTree(req: Request, res: Response) {
  const result = await creatorStudioService.getTree(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateTree(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createTree(userId, req.body as { name: string }));
}
export async function handleUpdateTree(req: Request, res: Response) {
  const result = await creatorStudioService.updateTree(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteTree(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteTree(req.params["id"] as string));
}

// ── Logic Graphs ──────────────────────────────────────────────────────────────
export async function handleListGraphs(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listGraphs(userId));
}
export async function handleGetGraph(req: Request, res: Response) {
  const result = await creatorStudioService.getGraph(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateGraph(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createGraph(userId, req.body as { name: string }));
}
export async function handleUpdateGraph(req: Request, res: Response) {
  const result = await creatorStudioService.updateGraph(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteGraph(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteGraph(req.params["id"] as string));
}

// ── Publish Jobs ──────────────────────────────────────────────────────────────
export async function handleListJobs(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listJobs(userId));
}
export async function handleGetJob(req: Request, res: Response) {
  const result = await creatorStudioService.getJob(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleRetryJob(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  const result = await creatorStudioService.retryJob(req.params["id"] as string, userId);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteJob(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteJob(req.params["id"] as string));
}

// ── Assets ────────────────────────────────────────────────────────────────────
export async function handleListAssets(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listAssets(userId));
}
export async function handleGetAsset(req: Request, res: Response) {
  const result = await creatorStudioService.getAsset(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateAsset(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createAsset(userId, req.body as { name: string; type: string; url: string }));
}
export async function handleDeleteAsset(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteAsset(req.params["id"] as string));
}

// ── Packages ──────────────────────────────────────────────────────────────────
export async function handleListPackages(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listPackages(userId));
}
export async function handleListPublicPackages(_req: Request, res: Response) {
  res.json(await creatorStudioService.listPublicPackages());
}
export async function handleGetPackage(req: Request, res: Response) {
  const result = await creatorStudioService.getPackage(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreatePackage(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createPackage(userId, req.body as { name: string }));
}
export async function handleUpdatePackage(req: Request, res: Response) {
  const result = await creatorStudioService.updatePackage(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeletePackage(req: Request, res: Response) {
  res.json(await creatorStudioService.deletePackage(req.params["id"] as string));
}
export async function handleInstallPackage(req: Request, res: Response) {
  res.json(await creatorStudioService.installPackage(req.params["id"] as string));
}

// ── Plugins ───────────────────────────────────────────────────────────────────
export async function handleListPlugins(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listPlugins(userId));
}
export async function handleGetPlugin(req: Request, res: Response) {
  const result = await creatorStudioService.getPlugin(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreatePlugin(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createPlugin(userId, req.body as { name: string }));
}
export async function handleUpdatePlugin(req: Request, res: Response) {
  const result = await creatorStudioService.updatePlugin(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeletePlugin(req: Request, res: Response) {
  res.json(await creatorStudioService.deletePlugin(req.params["id"] as string));
}
export async function handleEnablePlugin(req: Request, res: Response) {
  res.json(await creatorStudioService.enablePlugin(req.params["id"] as string));
}
export async function handleDisablePlugin(req: Request, res: Response) {
  res.json(await creatorStudioService.disablePlugin(req.params["id"] as string));
}

// ── Templates ─────────────────────────────────────────────────────────────────
export async function handleListTemplates(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  res.json(await creatorStudioService.listTemplates(userId ?? undefined));
}
export async function handleGetTemplate(req: Request, res: Response) {
  const result = await creatorStudioService.getTemplate(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateTemplate(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createTemplate(userId, req.body as { name: string; docType: string }));
}
export async function handleUpdateTemplate(req: Request, res: Response) {
  const result = await creatorStudioService.updateTemplate(req.params["id"] as string, req.body as Record<string, unknown>);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleDeleteTemplate(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteTemplate(req.params["id"] as string));
}
export async function handleUseTemplate(req: Request, res: Response) {
  const result = await creatorStudioService.useTemplate(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}

// ── History ───────────────────────────────────────────────────────────────────
export async function handleListHistory(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listHistory(userId));
}
export async function handleListDocHistory(req: Request, res: Response) {
  res.json(await creatorStudioService.listDocHistory(req.params["docId"] as string));
}
export async function handleDeleteHistory(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteHistory(req.params["id"] as string));
}

// ── Backups ───────────────────────────────────────────────────────────────────
export async function handleListBackups(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.listBackups(userId));
}
export async function handleGetBackup(req: Request, res: Response) {
  const result = await creatorStudioService.getBackup(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}
export async function handleCreateBackup(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.status(201).json(await creatorStudioService.createBackup(userId, req.body as { name: string }));
}
export async function handleDeleteBackup(req: Request, res: Response) {
  res.json(await creatorStudioService.deleteBackup(req.params["id"] as string));
}
export async function handleRestoreBackup(req: Request, res: Response) {
  const result = await creatorStudioService.restoreBackup(req.params["id"] as string);
  res.status(result.ok ? 200 : 404).json(result);
}

// ── Import / Export ───────────────────────────────────────────────────────────
export async function handleImport(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.importData(userId, req.body as Record<string, unknown>));
}
export async function handleExport(req: Request, res: Response) {
  const userId = await resolveUserId(req);
  if (!userId) { res.status(401).json({ ok: false, error: "Unauthorized" }); return; }
  res.json(await creatorStudioService.exportData(userId));
}
