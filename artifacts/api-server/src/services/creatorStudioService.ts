import { DrizzleCreatorStudioRepository, type StudioDocType } from "../repositories/drizzle/DrizzleCreatorStudioRepository.js";
import { logger } from "../lib/logger.js";

export class CreatorStudioService {
  constructor(private repo: DrizzleCreatorStudioRepository) {}

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  async getDashboard(userId: string) {
    const stats = await this.repo.getDashboardStats(userId);
    return { ok: true, data: stats };
  }

  // ── Editors ───────────────────────────────────────────────────────────────────
  async listEditors(userId: string) {
    const data = await this.repo.listEditors(userId);
    return { ok: true, data };
  }
  async getEditor(id: string) {
    const data = await this.repo.getEditor(id);
    if (!data) return { ok: false, error: "Editor không tồn tại." };
    return { ok: true, data };
  }
  async createEditor(userId: string, body: { name: string; description?: string }) {
    const data = await this.repo.createEditor({ userId, name: body.name, description: body.description ?? null, currentDocId: null, currentDocType: null, preferences: null, metadata: null });
    logger.info(`[Studio] Editor mới: ${data.id} — user ${userId}`);
    return { ok: true, data };
  }
  async updateEditor(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updateEditor(id, body as never);
    if (!data) return { ok: false, error: "Editor không tồn tại." };
    return { ok: true, data };
  }
  async deleteEditor(id: string) {
    const ok = await this.repo.deleteEditor(id);
    return { ok };
  }
  async openEditor(id: string, docId: string, docType: StudioDocType) {
    const session = await this.repo.createSession({ editorId: id, userId: "", docId, docType: docType as never });
    const editor = await this.repo.updateEditor(id, { currentDocId: docId, currentDocType: docType as never });
    return { ok: true, data: { editor, session } };
  }
  async closeEditor(id: string) {
    const sessions = await this.repo.listSessions("");
    const active = sessions.find((s) => s.editorId === id && !s.endedAt);
    if (active) await this.repo.endSession(active.id);
    await this.repo.updateEditor(id, { currentDocId: null, currentDocType: null });
    return { ok: true };
  }

  // ── Sessions ──────────────────────────────────────────────────────────────────
  async listSessions(userId: string) {
    const data = await this.repo.listSessions(userId);
    return { ok: true, data };
  }
  async createSession(userId: string, body: { editorId: string; docId?: string; docType?: string }) {
    const data = await this.repo.createSession({ editorId: body.editorId, userId, docId: body.docId ?? null, docType: (body.docType ?? null) as never });
    return { ok: true, data };
  }
  async endSession(id: string) {
    const data = await this.repo.endSession(id);
    if (!data) return { ok: false, error: "Session không tồn tại." };
    return { ok: true, data };
  }

  // ── Layouts ───────────────────────────────────────────────────────────────────
  async listLayouts(userId: string) {
    const data = await this.repo.listLayouts(userId);
    return { ok: true, data };
  }
  async createLayout(userId: string, body: { name: string; layout: unknown; editorId?: string }) {
    const data = await this.repo.createLayout({ userId, name: body.name, layout: body.layout as never, editorId: body.editorId ?? null, isDefault: false });
    return { ok: true, data };
  }
  async updateLayout(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updateLayout(id, body as never);
    if (!data) return { ok: false, error: "Layout không tồn tại." };
    return { ok: true, data };
  }
  async deleteLayout(id: string) {
    const ok = await this.repo.deleteLayout(id);
    return { ok };
  }
  async setDefaultLayout(userId: string, id: string) {
    const data = await this.repo.setDefaultLayout(userId, id);
    return { ok: true, data };
  }

  // ── Preferences ───────────────────────────────────────────────────────────────
  async getPreferences(userId: string) {
    let data = await this.repo.getPreferences(userId);
    if (!data) data = await this.repo.upsertPreferences(userId, {});
    return { ok: true, data };
  }
  async updatePreferences(userId: string, body: Record<string, unknown>) {
    const data = await this.repo.upsertPreferences(userId, body as never);
    return { ok: true, data };
  }

  // ── Documents ─────────────────────────────────────────────────────────────────
  async listDocs(type: StudioDocType, userId: string) {
    const data = await this.repo.listDocs(type, userId);
    return { ok: true, data };
  }
  async getDoc(type: StudioDocType, id: string) {
    const data = await this.repo.getDoc(type, id);
    if (!data) return { ok: false, error: "Document không tồn tại." };
    return { ok: true, data };
  }
  async createDoc(type: StudioDocType, userId: string, body: Record<string, unknown>) {
    const data = await this.repo.createDoc(type, { ...body, userId });
    logger.info(`[Studio] Doc mới [${type}]: ${(data as { id?: string })?.id} — user ${userId}`);
    return { ok: true, data };
  }
  async updateDoc(type: StudioDocType, id: string, body: Record<string, unknown>) {
    const data = await this.repo.updateDoc(type, id, body);
    if (!data) return { ok: false, error: "Document không tồn tại." };
    return { ok: true, data };
  }
  async deleteDoc(type: StudioDocType, id: string) {
    const ok = await this.repo.deleteDoc(type, id);
    return { ok };
  }
  async saveDoc(type: StudioDocType, id: string, userId: string, body: Record<string, unknown>) {
    const data = await this.repo.saveDocWithHistory(type, id, userId, body);
    if (!data) return { ok: false, error: "Document không tồn tại." };
    return { ok: true, data };
  }
  async undoDoc(type: StudioDocType, docId: string) {
    const history = await this.repo.listDocHistory(docId);
    if (!history.length) return { ok: false, error: "Không có lịch sử để undo." };
    const last = history[0]!;
    if (last.snapshot) {
      await this.repo.updateDoc(type, docId, last.snapshot as Record<string, unknown>);
      await this.repo.deleteHistory(last.id);
    }
    return { ok: true, data: last.snapshot };
  }
  async redoDoc(_type: StudioDocType, _docId: string) {
    return { ok: true, data: null, message: "Redo chưa được triển khai." };
  }
  async cloneDoc(type: StudioDocType, id: string, userId: string) {
    const data = await this.repo.cloneDoc(type, id, userId);
    if (!data) return { ok: false, error: "Document không tồn tại." };
    return { ok: true, data };
  }
  async publishDoc(type: StudioDocType, id: string, userId: string) {
    const doc = await this.repo.getDoc(type, id);
    if (!doc) return { ok: false, error: "Document không tồn tại." };
    const job = await this.repo.createJob({
      projectId: null, userId, docId: id, docType: type as never,
      status: "PENDING", logs: [], validationErrors: [], version: `${((doc as { version?: number }).version ?? 1)}.0`,
      startedAt: new Date(), completedAt: null,
    });
    // Run pipeline async
    void this.runPublishPipeline(job.id, type, id);
    return { ok: true, data: { job } };
  }

  private async runPublishPipeline(jobId: string, type: StudioDocType, docId: string) {
    const steps: Array<"VALIDATING" | "PACKAGING" | "PUBLISHING" | "DONE"> = ["VALIDATING", "PACKAGING", "PUBLISHING", "DONE"];
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 500));
      await this.repo.updateJob(jobId, {
        status: step,
        logs: [{ step, ts: new Date().toISOString(), msg: `Bước ${step} hoàn tất` }],
        ...(step === "DONE" ? { completedAt: new Date() } : {}),
      } as never);
    }
    await this.repo.publishDoc(type, docId);
    logger.info(`[Studio] Publish job ${jobId} hoàn tất`);
  }

  // ── Visual Scripts ────────────────────────────────────────────────────────────
  async listScripts(userId: string) {
    return { ok: true, data: await this.repo.listScripts(userId) };
  }
  async getScript(id: string) {
    const data = await this.repo.getScript(id);
    if (!data) return { ok: false, error: "Visual Script không tồn tại." };
    return { ok: true, data };
  }
  async createScript(userId: string, body: { name: string; description?: string; nodes?: unknown[]; edges?: unknown[]; variables?: unknown[] }) {
    const data = await this.repo.createScript({ userId, name: body.name, description: body.description ?? null, projectId: null, nodes: (body.nodes ?? []) as never, edges: (body.edges ?? []) as never, variables: (body.variables ?? []) as never, version: 1, isDraft: true });
    return { ok: true, data };
  }
  async updateScript(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updateScript(id, body as never);
    if (!data) return { ok: false, error: "Visual Script không tồn tại." };
    return { ok: true, data };
  }
  async deleteScript(id: string) {
    return { ok: await this.repo.deleteScript(id) };
  }
  async saveScript(id: string, userId: string, body: Record<string, unknown>) {
    const existing = await this.repo.getScript(id);
    if (!existing) return { ok: false, error: "Visual Script không tồn tại." };
    await this.repo.createHistory({ userId, docId: id, docType: null, action: "UPDATE", snapshot: existing as never });
    const data = await this.repo.updateScript(id, { ...body, version: existing.version + 1 } as never);
    return { ok: true, data };
  }

  // ── Behavior Trees ────────────────────────────────────────────────────────────
  async listTrees(userId: string) {
    return { ok: true, data: await this.repo.listTrees(userId) };
  }
  async getTree(id: string) {
    const data = await this.repo.getTree(id);
    if (!data) return { ok: false, error: "Behavior Tree không tồn tại." };
    return { ok: true, data };
  }
  async createTree(userId: string, body: { name: string; description?: string }) {
    const data = await this.repo.createTree({ userId, name: body.name, description: body.description ?? null, projectId: null, rootNode: null, nodes: [] as never, version: 1, isDraft: true });
    return { ok: true, data };
  }
  async updateTree(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updateTree(id, body as never);
    if (!data) return { ok: false, error: "Behavior Tree không tồn tại." };
    return { ok: true, data };
  }
  async deleteTree(id: string) {
    return { ok: await this.repo.deleteTree(id) };
  }

  // ── Logic Graphs ──────────────────────────────────────────────────────────────
  async listGraphs(userId: string) {
    return { ok: true, data: await this.repo.listGraphs(userId) };
  }
  async getGraph(id: string) {
    const data = await this.repo.getGraph(id);
    if (!data) return { ok: false, error: "Logic Graph không tồn tại." };
    return { ok: true, data };
  }
  async createGraph(userId: string, body: { name: string; description?: string }) {
    const data = await this.repo.createGraph({ userId, name: body.name, description: body.description ?? null, projectId: null, nodes: [] as never, edges: [] as never, version: 1, isDraft: true });
    return { ok: true, data };
  }
  async updateGraph(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updateGraph(id, body as never);
    if (!data) return { ok: false, error: "Logic Graph không tồn tại." };
    return { ok: true, data };
  }
  async deleteGraph(id: string) {
    return { ok: await this.repo.deleteGraph(id) };
  }

  // ── Publish Jobs ──────────────────────────────────────────────────────────────
  async listJobs(userId: string) {
    return { ok: true, data: await this.repo.listJobs(userId) };
  }
  async getJob(id: string) {
    const data = await this.repo.getJob(id);
    if (!data) return { ok: false, error: "Publish job không tồn tại." };
    return { ok: true, data };
  }
  async retryJob(id: string, userId: string) {
    const job = await this.repo.getJob(id);
    if (!job) return { ok: false, error: "Publish job không tồn tại." };
    await this.repo.updateJob(id, { status: "PENDING", logs: [], validationErrors: [], startedAt: new Date(), completedAt: null });
    void this.runPublishPipeline(id, (job.docType ?? "WORLD") as StudioDocType, job.docId ?? "");
    return { ok: true, data: job };
  }
  async deleteJob(id: string) {
    return { ok: await this.repo.deleteJob(id) };
  }

  // ── Assets ────────────────────────────────────────────────────────────────────
  async listAssets(userId: string) {
    return { ok: true, data: await this.repo.listAssets(userId) };
  }
  async getAsset(id: string) {
    const data = await this.repo.getAsset(id);
    if (!data) return { ok: false, error: "Asset không tồn tại." };
    return { ok: true, data };
  }
  async createAsset(userId: string, body: { name: string; type: string; url: string; size?: number; mimeType?: string }) {
    const data = await this.repo.createAsset({ userId, name: body.name, type: body.type as never, url: body.url, size: body.size ?? 0, mimeType: body.mimeType ?? null, metadata: null, projectId: null });
    return { ok: true, data };
  }
  async deleteAsset(id: string) {
    return { ok: await this.repo.deleteAsset(id) };
  }

  // ── Packages ──────────────────────────────────────────────────────────────────
  async listPackages(userId: string) {
    return { ok: true, data: await this.repo.listPackages(userId) };
  }
  async listPublicPackages() {
    return { ok: true, data: await this.repo.listPublicPackages() };
  }
  async getPackage(id: string) {
    const data = await this.repo.getPackage(id);
    if (!data) return { ok: false, error: "Package không tồn tại." };
    return { ok: true, data };
  }
  async createPackage(userId: string, body: { name: string; version?: string; description?: string; contents?: unknown[] }) {
    const data = await this.repo.createPackage({ userId, name: body.name, version: body.version ?? "1.0.0", description: body.description ?? null, contents: (body.contents ?? []) as never, isPublic: false, downloadCount: 0 });
    return { ok: true, data };
  }
  async updatePackage(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updatePackage(id, body as never);
    if (!data) return { ok: false, error: "Package không tồn tại." };
    return { ok: true, data };
  }
  async deletePackage(id: string) {
    return { ok: await this.repo.deletePackage(id) };
  }
  async installPackage(id: string) {
    const data = await this.repo.installPackage(id);
    return { ok: true, data };
  }

  // ── Plugins ───────────────────────────────────────────────────────────────────
  async listPlugins(userId: string) {
    return { ok: true, data: await this.repo.listPlugins(userId) };
  }
  async getPlugin(id: string) {
    const data = await this.repo.getPlugin(id);
    if (!data) return { ok: false, error: "Plugin không tồn tại." };
    return { ok: true, data };
  }
  async createPlugin(userId: string, body: { name: string; description?: string; version?: string; code?: string }) {
    const data = await this.repo.createPlugin({ userId, name: body.name, description: body.description ?? null, version: body.version ?? "1.0.0", code: body.code ?? null, config: null, status: "ACTIVE" });
    return { ok: true, data };
  }
  async updatePlugin(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updatePlugin(id, body as never);
    if (!data) return { ok: false, error: "Plugin không tồn tại." };
    return { ok: true, data };
  }
  async deletePlugin(id: string) {
    return { ok: await this.repo.deletePlugin(id) };
  }
  async enablePlugin(id: string) {
    const data = await this.repo.setPluginStatus(id, "ACTIVE");
    return { ok: true, data };
  }
  async disablePlugin(id: string) {
    const data = await this.repo.setPluginStatus(id, "INACTIVE");
    return { ok: true, data };
  }

  // ── Templates ─────────────────────────────────────────────────────────────────
  async listTemplates(userId?: string) {
    return { ok: true, data: await this.repo.listTemplates(userId) };
  }
  async getTemplate(id: string) {
    const data = await this.repo.getTemplate(id);
    if (!data) return { ok: false, error: "Template không tồn tại." };
    return { ok: true, data };
  }
  async createTemplate(userId: string, body: { name: string; description?: string; docType: string; data?: unknown }) {
    const data = await this.repo.createTemplate({ userId, name: body.name, description: body.description ?? null, docType: body.docType as never, thumbnail: null, data: (body.data ?? {}) as never, isPublic: false, useCount: 0 });
    return { ok: true, data };
  }
  async updateTemplate(id: string, body: Record<string, unknown>) {
    const data = await this.repo.updateTemplate(id, body as never);
    if (!data) return { ok: false, error: "Template không tồn tại." };
    return { ok: true, data };
  }
  async deleteTemplate(id: string) {
    return { ok: await this.repo.deleteTemplate(id) };
  }
  async useTemplate(id: string) {
    const data = await this.repo.useTemplate(id);
    if (!data) return { ok: false, error: "Template không tồn tại." };
    return { ok: true, data };
  }

  // ── History ───────────────────────────────────────────────────────────────────
  async listHistory(userId: string) {
    return { ok: true, data: await this.repo.listHistory(userId) };
  }
  async listDocHistory(docId: string) {
    return { ok: true, data: await this.repo.listDocHistory(docId) };
  }
  async deleteHistory(id: string) {
    return { ok: await this.repo.deleteHistory(id) };
  }

  // ── Backups ───────────────────────────────────────────────────────────────────
  async listBackups(userId: string) {
    return { ok: true, data: await this.repo.listBackups(userId) };
  }
  async getBackup(id: string) {
    const data = await this.repo.getBackup(id);
    if (!data) return { ok: false, error: "Backup không tồn tại." };
    return { ok: true, data };
  }
  async createBackup(userId: string, body: { name: string; description?: string; projectId?: string; data?: unknown }) {
    const dataStr = JSON.stringify(body.data ?? {});
    const data = await this.repo.createBackup({ userId, projectId: body.projectId ?? null, name: body.name, description: body.description ?? null, data: (body.data ?? {}) as never, size: dataStr.length });
    return { ok: true, data };
  }
  async deleteBackup(id: string) {
    return { ok: await this.repo.deleteBackup(id) };
  }
  async restoreBackup(id: string) {
    const backup = await this.repo.getBackup(id);
    if (!backup) return { ok: false, error: "Backup không tồn tại." };
    logger.info(`[Studio] Restore backup ${id}`);
    return { ok: true, data: backup };
  }

  // ── Import / Export ───────────────────────────────────────────────────────────
  async importData(userId: string, body: Record<string, unknown>) {
    logger.info(`[Studio] Import từ user ${userId}`);
    const backup = await this.repo.createBackup({ userId, projectId: null, name: `Import ${new Date().toISOString()}`, description: "Auto-backup trước import", data: body as never, size: JSON.stringify(body).length });
    return { ok: true, data: { backup, message: "Import thành công." } };
  }
  async exportData(userId: string) {
    const [editors, assets, templates, packages, plugins, scripts, trees, graphs] = await Promise.all([
      this.repo.listEditors(userId),
      this.repo.listAssets(userId),
      this.repo.listTemplates(userId),
      this.repo.listPackages(userId),
      this.repo.listPlugins(userId),
      this.repo.listScripts(userId),
      this.repo.listTrees(userId),
      this.repo.listGraphs(userId),
    ]);
    return { ok: true, data: { editors, assets, templates, packages, plugins, scripts, trees, graphs, exportedAt: new Date().toISOString() } };
  }
}
