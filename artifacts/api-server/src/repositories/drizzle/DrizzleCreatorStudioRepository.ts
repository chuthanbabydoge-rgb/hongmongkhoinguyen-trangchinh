import { createId } from "@paralleldrive/cuid2";
import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  studioEditorsTable, editorSessionsTable, editorLayoutsTable, editorPreferencesTable,
  worldDocumentsTable, npcDocumentsTable, questDocumentsTable, bossDocumentsTable,
  dungeonDocumentsTable, itemDocumentsTable, skillDocumentsTable, petDocumentsTable,
  mountDocumentsTable, buildingDocumentsTable, cityDocumentsTable, sportsDocumentsTable,
  educationDocumentsTable, companyDocumentsTable, dialogDocumentsTable,
  behaviorTreesTable, visualScriptsTable, logicGraphsTable,
  publishJobsTable, studioAssetsTable, studioPackagesTable, studioPluginsTable,
  studioTemplatesTable, studioHistoryTable, studioBackupsTable,
} from "@workspace/db/schema";

// Map doc type → table
const DOC_TABLE_MAP = {
  WORLD:     worldDocumentsTable,
  NPC:       npcDocumentsTable,
  QUEST:     questDocumentsTable,
  BOSS:      bossDocumentsTable,
  DUNGEON:   dungeonDocumentsTable,
  ITEM:      itemDocumentsTable,
  SKILL:     skillDocumentsTable,
  PET:       petDocumentsTable,
  MOUNT:     mountDocumentsTable,
  BUILDING:  buildingDocumentsTable,
  CITY:      cityDocumentsTable,
  SPORTS:    sportsDocumentsTable,
  EDUCATION: educationDocumentsTable,
  COMPANY:   companyDocumentsTable,
  DIALOG:    dialogDocumentsTable,
} as const;

export type StudioDocType = keyof typeof DOC_TABLE_MAP;

export class DrizzleCreatorStudioRepository {
  // ── Editors ─────────────────────────────────────────────────────────────────
  async listEditors(userId: string) {
    return db.select().from(studioEditorsTable).where(eq(studioEditorsTable.userId, userId)).orderBy(desc(studioEditorsTable.updatedAt));
  }
  async getEditor(id: string) {
    const [r] = await db.select().from(studioEditorsTable).where(eq(studioEditorsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createEditor(data: Omit<typeof studioEditorsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(studioEditorsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateEditor(id: string, data: Partial<typeof studioEditorsTable.$inferInsert>) {
    const [r] = await db.update(studioEditorsTable).set({ ...data, updatedAt: new Date() }).where(eq(studioEditorsTable.id, id)).returning();
    return r ?? null;
  }
  async deleteEditor(id: string) {
    const [r] = await db.delete(studioEditorsTable).where(eq(studioEditorsTable.id, id)).returning();
    return !!r;
  }

  // ── Sessions ─────────────────────────────────────────────────────────────────
  async listSessions(userId: string) {
    return db.select().from(editorSessionsTable).where(eq(editorSessionsTable.userId, userId)).orderBy(desc(editorSessionsTable.startedAt));
  }
  async createSession(data: Omit<typeof editorSessionsTable.$inferInsert, "id" | "startedAt">) {
    const [r] = await db.insert(editorSessionsTable).values({ ...data, id: createId(), startedAt: new Date() }).returning();
    return r!;
  }
  async endSession(id: string) {
    const [r] = await db.update(editorSessionsTable).set({ endedAt: new Date() }).where(eq(editorSessionsTable.id, id)).returning();
    return r ?? null;
  }

  // ── Layouts ───────────────────────────────────────────────────────────────────
  async listLayouts(userId: string) {
    return db.select().from(editorLayoutsTable).where(eq(editorLayoutsTable.userId, userId)).orderBy(editorLayoutsTable.name);
  }
  async getLayout(id: string) {
    const [r] = await db.select().from(editorLayoutsTable).where(eq(editorLayoutsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createLayout(data: Omit<typeof editorLayoutsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(editorLayoutsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateLayout(id: string, data: Partial<typeof editorLayoutsTable.$inferInsert>) {
    const [r] = await db.update(editorLayoutsTable).set({ ...data, updatedAt: new Date() }).where(eq(editorLayoutsTable.id, id)).returning();
    return r ?? null;
  }
  async deleteLayout(id: string) {
    const [r] = await db.delete(editorLayoutsTable).where(eq(editorLayoutsTable.id, id)).returning();
    return !!r;
  }
  async setDefaultLayout(userId: string, layoutId: string) {
    await db.update(editorLayoutsTable).set({ isDefault: false }).where(eq(editorLayoutsTable.userId, userId));
    const [r] = await db.update(editorLayoutsTable).set({ isDefault: true, updatedAt: new Date() }).where(eq(editorLayoutsTable.id, layoutId)).returning();
    return r ?? null;
  }

  // ── Preferences ───────────────────────────────────────────────────────────────
  async getPreferences(userId: string) {
    const [r] = await db.select().from(editorPreferencesTable).where(eq(editorPreferencesTable.userId, userId)).limit(1);
    return r ?? null;
  }
  async upsertPreferences(userId: string, data: Partial<typeof editorPreferencesTable.$inferInsert>) {
    const existing = await this.getPreferences(userId);
    if (existing) {
      const [r] = await db.update(editorPreferencesTable).set({ ...data, updatedAt: new Date() }).where(eq(editorPreferencesTable.userId, userId)).returning();
      return r!;
    }
    const [r] = await db.insert(editorPreferencesTable).values({ ...data, id: createId(), userId, updatedAt: new Date() }).returning();
    return r!;
  }

  // ── Documents (generic) ───────────────────────────────────────────────────────
  async listDocs(type: StudioDocType, userId: string) {
    const t = DOC_TABLE_MAP[type] as typeof worldDocumentsTable;
    return db.select().from(t).where(eq(t.userId, userId)).orderBy(desc(t.updatedAt));
  }
  async getDoc(type: StudioDocType, id: string) {
    const t = DOC_TABLE_MAP[type] as typeof worldDocumentsTable;
    const [r] = await db.select().from(t).where(eq(t.id, id)).limit(1);
    return r ?? null;
  }
  async createDoc(type: StudioDocType, data: Record<string, unknown>) {
    const t = DOC_TABLE_MAP[type] as typeof worldDocumentsTable;
    const now = new Date();
    const [r] = await db.insert(t).values({ ...(data as object), id: createId(), createdAt: now, updatedAt: now } as never).returning();
    return r;
  }
  async updateDoc(type: StudioDocType, id: string, data: Record<string, unknown>) {
    const t = DOC_TABLE_MAP[type] as typeof worldDocumentsTable;
    const [r] = await db.update(t).set({ ...(data as object), updatedAt: new Date() } as never).where(eq(t.id, id)).returning();
    return r ?? null;
  }
  async deleteDoc(type: StudioDocType, id: string) {
    const t = DOC_TABLE_MAP[type] as typeof worldDocumentsTable;
    const [r] = await db.delete(t).where(eq(t.id, id)).returning();
    return !!r;
  }
  async saveDocWithHistory(type: StudioDocType, id: string, userId: string, data: Record<string, unknown>) {
    const doc = await this.getDoc(type, id);
    if (doc) {
      await this.createHistory({ userId, docId: id, docType: type as never, action: "UPDATE", snapshot: doc });
      const updated = await this.updateDoc(type, id, { ...data, version: ((doc as { version?: number }).version ?? 0) + 1 });
      return updated;
    }
    return null;
  }
  async cloneDoc(type: StudioDocType, id: string, userId: string) {
    const doc = await this.getDoc(type, id);
    if (!doc) return null;
    const { id: _id, createdAt: _c, updatedAt: _u, publishedAt: _p, ...rest } = doc as Record<string, unknown>;
    void _id; void _c; void _u; void _p;
    return this.createDoc(type, { ...rest, userId, name: `${(rest["name"] as string) ?? "Doc"} (Bản sao)`, isDraft: true, version: 1 });
  }
  async publishDoc(type: StudioDocType, id: string) {
    return this.updateDoc(type, id, { isDraft: false, publishedAt: new Date() });
  }

  // ── Visual Scripts ────────────────────────────────────────────────────────────
  async listScripts(userId: string) {
    return db.select().from(visualScriptsTable).where(eq(visualScriptsTable.userId, userId)).orderBy(desc(visualScriptsTable.updatedAt));
  }
  async getScript(id: string) {
    const [r] = await db.select().from(visualScriptsTable).where(eq(visualScriptsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createScript(data: Omit<typeof visualScriptsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(visualScriptsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateScript(id: string, data: Partial<typeof visualScriptsTable.$inferInsert>) {
    const [r] = await db.update(visualScriptsTable).set({ ...data, updatedAt: new Date() }).where(eq(visualScriptsTable.id, id)).returning();
    return r ?? null;
  }
  async deleteScript(id: string) {
    const [r] = await db.delete(visualScriptsTable).where(eq(visualScriptsTable.id, id)).returning();
    return !!r;
  }

  // ── Behavior Trees ────────────────────────────────────────────────────────────
  async listTrees(userId: string) {
    return db.select().from(behaviorTreesTable).where(eq(behaviorTreesTable.userId, userId)).orderBy(desc(behaviorTreesTable.updatedAt));
  }
  async getTree(id: string) {
    const [r] = await db.select().from(behaviorTreesTable).where(eq(behaviorTreesTable.id, id)).limit(1);
    return r ?? null;
  }
  async createTree(data: Omit<typeof behaviorTreesTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(behaviorTreesTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateTree(id: string, data: Partial<typeof behaviorTreesTable.$inferInsert>) {
    const [r] = await db.update(behaviorTreesTable).set({ ...data, updatedAt: new Date() }).where(eq(behaviorTreesTable.id, id)).returning();
    return r ?? null;
  }
  async deleteTree(id: string) {
    const [r] = await db.delete(behaviorTreesTable).where(eq(behaviorTreesTable.id, id)).returning();
    return !!r;
  }

  // ── Logic Graphs ──────────────────────────────────────────────────────────────
  async listGraphs(userId: string) {
    return db.select().from(logicGraphsTable).where(eq(logicGraphsTable.userId, userId)).orderBy(desc(logicGraphsTable.updatedAt));
  }
  async getGraph(id: string) {
    const [r] = await db.select().from(logicGraphsTable).where(eq(logicGraphsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createGraph(data: Omit<typeof logicGraphsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(logicGraphsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateGraph(id: string, data: Partial<typeof logicGraphsTable.$inferInsert>) {
    const [r] = await db.update(logicGraphsTable).set({ ...data, updatedAt: new Date() }).where(eq(logicGraphsTable.id, id)).returning();
    return r ?? null;
  }
  async deleteGraph(id: string) {
    const [r] = await db.delete(logicGraphsTable).where(eq(logicGraphsTable.id, id)).returning();
    return !!r;
  }

  // ── Publish Jobs ──────────────────────────────────────────────────────────────
  async listJobs(userId: string) {
    return db.select().from(publishJobsTable).where(eq(publishJobsTable.userId, userId)).orderBy(desc(publishJobsTable.createdAt));
  }
  async getJob(id: string) {
    const [r] = await db.select().from(publishJobsTable).where(eq(publishJobsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createJob(data: Omit<typeof publishJobsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(publishJobsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateJob(id: string, data: Partial<typeof publishJobsTable.$inferInsert>) {
    const [r] = await db.update(publishJobsTable).set({ ...data, updatedAt: new Date() }).where(eq(publishJobsTable.id, id)).returning();
    return r ?? null;
  }
  async deleteJob(id: string) {
    const [r] = await db.delete(publishJobsTable).where(eq(publishJobsTable.id, id)).returning();
    return !!r;
  }

  // ── Assets ────────────────────────────────────────────────────────────────────
  async listAssets(userId: string) {
    return db.select().from(studioAssetsTable).where(eq(studioAssetsTable.userId, userId)).orderBy(desc(studioAssetsTable.createdAt));
  }
  async getAsset(id: string) {
    const [r] = await db.select().from(studioAssetsTable).where(eq(studioAssetsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createAsset(data: Omit<typeof studioAssetsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(studioAssetsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async deleteAsset(id: string) {
    const [r] = await db.delete(studioAssetsTable).where(eq(studioAssetsTable.id, id)).returning();
    return !!r;
  }

  // ── Packages ──────────────────────────────────────────────────────────────────
  async listPackages(userId: string) {
    return db.select().from(studioPackagesTable).where(eq(studioPackagesTable.userId, userId)).orderBy(desc(studioPackagesTable.createdAt));
  }
  async listPublicPackages() {
    return db.select().from(studioPackagesTable).where(eq(studioPackagesTable.isPublic, true)).orderBy(desc(studioPackagesTable.downloadCount));
  }
  async getPackage(id: string) {
    const [r] = await db.select().from(studioPackagesTable).where(eq(studioPackagesTable.id, id)).limit(1);
    return r ?? null;
  }
  async createPackage(data: Omit<typeof studioPackagesTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(studioPackagesTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updatePackage(id: string, data: Partial<typeof studioPackagesTable.$inferInsert>) {
    const [r] = await db.update(studioPackagesTable).set({ ...data, updatedAt: new Date() }).where(eq(studioPackagesTable.id, id)).returning();
    return r ?? null;
  }
  async deletePackage(id: string) {
    const [r] = await db.delete(studioPackagesTable).where(eq(studioPackagesTable.id, id)).returning();
    return !!r;
  }
  async installPackage(id: string) {
    const [r] = await db.update(studioPackagesTable).set({ downloadCount: (await this.getPackage(id))!.downloadCount + 1, updatedAt: new Date() }).where(eq(studioPackagesTable.id, id)).returning();
    return r ?? null;
  }

  // ── Plugins ───────────────────────────────────────────────────────────────────
  async listPlugins(userId: string) {
    return db.select().from(studioPluginsTable).where(eq(studioPluginsTable.userId, userId)).orderBy(desc(studioPluginsTable.createdAt));
  }
  async getPlugin(id: string) {
    const [r] = await db.select().from(studioPluginsTable).where(eq(studioPluginsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createPlugin(data: Omit<typeof studioPluginsTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(studioPluginsTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updatePlugin(id: string, data: Partial<typeof studioPluginsTable.$inferInsert>) {
    const [r] = await db.update(studioPluginsTable).set({ ...data, updatedAt: new Date() }).where(eq(studioPluginsTable.id, id)).returning();
    return r ?? null;
  }
  async deletePlugin(id: string) {
    const [r] = await db.delete(studioPluginsTable).where(eq(studioPluginsTable.id, id)).returning();
    return !!r;
  }
  async setPluginStatus(id: string, status: "ACTIVE" | "INACTIVE" | "ERROR") {
    const [r] = await db.update(studioPluginsTable).set({ status, updatedAt: new Date() }).where(eq(studioPluginsTable.id, id)).returning();
    return r ?? null;
  }

  // ── Templates ─────────────────────────────────────────────────────────────────
  async listTemplates(userId?: string) {
    if (userId) {
      return db.select().from(studioTemplatesTable).where(eq(studioTemplatesTable.userId, userId)).orderBy(desc(studioTemplatesTable.updatedAt));
    }
    return db.select().from(studioTemplatesTable).where(eq(studioTemplatesTable.isPublic, true)).orderBy(desc(studioTemplatesTable.useCount));
  }
  async getTemplate(id: string) {
    const [r] = await db.select().from(studioTemplatesTable).where(eq(studioTemplatesTable.id, id)).limit(1);
    return r ?? null;
  }
  async createTemplate(data: Omit<typeof studioTemplatesTable.$inferInsert, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const [r] = await db.insert(studioTemplatesTable).values({ ...data, id: createId(), createdAt: now, updatedAt: now }).returning();
    return r!;
  }
  async updateTemplate(id: string, data: Partial<typeof studioTemplatesTable.$inferInsert>) {
    const [r] = await db.update(studioTemplatesTable).set({ ...data, updatedAt: new Date() }).where(eq(studioTemplatesTable.id, id)).returning();
    return r ?? null;
  }
  async deleteTemplate(id: string) {
    const [r] = await db.delete(studioTemplatesTable).where(eq(studioTemplatesTable.id, id)).returning();
    return !!r;
  }
  async useTemplate(id: string) {
    const t = await this.getTemplate(id);
    if (t) {
      await db.update(studioTemplatesTable).set({ useCount: t.useCount + 1, updatedAt: new Date() }).where(eq(studioTemplatesTable.id, id));
    }
    return t;
  }

  // ── History ───────────────────────────────────────────────────────────────────
  async listHistory(userId: string) {
    return db.select().from(studioHistoryTable).where(eq(studioHistoryTable.userId, userId)).orderBy(desc(studioHistoryTable.createdAt)).limit(100);
  }
  async listDocHistory(docId: string) {
    return db.select().from(studioHistoryTable).where(eq(studioHistoryTable.docId, docId)).orderBy(desc(studioHistoryTable.createdAt)).limit(50);
  }
  async createHistory(data: Omit<typeof studioHistoryTable.$inferInsert, "id" | "createdAt">) {
    const [r] = await db.insert(studioHistoryTable).values({ ...data, id: createId(), createdAt: new Date() }).returning();
    return r!;
  }
  async deleteHistory(id: string) {
    const [r] = await db.delete(studioHistoryTable).where(eq(studioHistoryTable.id, id)).returning();
    return !!r;
  }

  // ── Backups ───────────────────────────────────────────────────────────────────
  async listBackups(userId: string) {
    return db.select().from(studioBackupsTable).where(eq(studioBackupsTable.userId, userId)).orderBy(desc(studioBackupsTable.createdAt));
  }
  async getBackup(id: string) {
    const [r] = await db.select().from(studioBackupsTable).where(eq(studioBackupsTable.id, id)).limit(1);
    return r ?? null;
  }
  async createBackup(data: Omit<typeof studioBackupsTable.$inferInsert, "id" | "createdAt">) {
    const [r] = await db.insert(studioBackupsTable).values({ ...data, id: createId(), createdAt: new Date() }).returning();
    return r!;
  }
  async deleteBackup(id: string) {
    const [r] = await db.delete(studioBackupsTable).where(eq(studioBackupsTable.id, id)).returning();
    return !!r;
  }

  // ── Dashboard Stats ───────────────────────────────────────────────────────────
  async getDashboardStats(userId: string) {
    const [editors, assets, templates, packages, plugins, history, backups] = await Promise.all([
      db.select().from(studioEditorsTable).where(eq(studioEditorsTable.userId, userId)),
      db.select().from(studioAssetsTable).where(eq(studioAssetsTable.userId, userId)),
      db.select().from(studioTemplatesTable).where(eq(studioTemplatesTable.userId, userId)),
      db.select().from(studioPackagesTable).where(eq(studioPackagesTable.userId, userId)),
      db.select().from(studioPluginsTable).where(eq(studioPluginsTable.userId, userId)),
      db.select().from(studioHistoryTable).where(eq(studioHistoryTable.userId, userId)).orderBy(desc(studioHistoryTable.createdAt)).limit(10),
      db.select().from(studioBackupsTable).where(eq(studioBackupsTable.userId, userId)),
    ]);
    const docTypes: StudioDocType[] = ["WORLD","NPC","QUEST","BOSS","DUNGEON","ITEM","SKILL","PET","MOUNT","BUILDING","CITY","SPORTS","EDUCATION","COMPANY","DIALOG"];
    let totalDocs = 0;
    for (const type of docTypes) {
      const t = DOC_TABLE_MAP[type] as typeof worldDocumentsTable;
      const rows = await db.select().from(t).where(eq(t.userId, userId));
      totalDocs += rows.length;
    }
    return {
      editors: editors.length,
      totalDocs,
      assets: assets.length,
      templates: templates.length,
      packages: packages.length,
      plugins: plugins.length,
      backups: backups.length,
      recentActivity: history,
    };
  }
}
