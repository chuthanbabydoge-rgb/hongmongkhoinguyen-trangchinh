// ─────────────────────────────────────────────────────────────────────────────
// DrizzleCreatorRepository — HUB-24
// ─────────────────────────────────────────────────────────────────────────────

import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@workspace/db";
import {
  creatorProjectsTable,
  creatorTemplatesTable,
  creatorAssetsTable,
  creatorTagsTable,
  creatorProjectMembersTable,
  creatorVersionsTable,
  creatorPublishLogsTable,
  creatorFavoritesTable,
  creatorCategoriesTable,
  creatorCommentsTable,
  type CreatorProject,
  type CreatorTemplate,
  type CreatorAsset,
  type CreatorMember,
  type CreatorVersion,
  type CreatorFavorite,
  type CreatorCategory,
  type CreatorComment,
} from "@workspace/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectType = "WORLD" | "NPC" | "QUEST" | "BUSINESS" | "STORY" | "EVENT" | "TOURNAMENT" | "SHOP" | "GUILD" | "DUNGEON";
export type ProjectStatus = "DRAFT" | "PRIVATE" | "PUBLIC" | "PUBLISHED" | "ARCHIVED";
export type MemberRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export type AssetType = "IMAGE" | "MODEL" | "JSON" | "SCRIPT" | "TEXT" | "ICON";

export interface CreateProjectInput {
  name: string;
  description?: string;
  type?: ProjectType;
  ownerId: string;
  templateId?: string;
  forkedFrom?: string;
  categoryId?: string;
  thumbnail?: string;
  content?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  thumbnail?: string;
  content?: Record<string, unknown>;
  tags?: string[];
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ListProjectsOptions {
  ownerId?: string;
  search?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export interface UploadAssetInput {
  ownerId: string;
  projectId?: string;
  name: string;
  type: AssetType;
  url: string;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

export interface CreatorDashboard {
  projects: CreatorProject[];
  published: number;
  assets: number;
  favorites: number;
  totalViews: number;
  recentActivity: CreatorProject[];
}

export interface ICreatorRepository {
  createProject(input: CreateProjectInput): Promise<CreatorProject>;
  updateProject(id: string, input: UpdateProjectInput): Promise<CreatorProject | null>;
  deleteProject(id: string): Promise<boolean>;
  publishProject(id: string, publishedBy: string, notes?: string): Promise<CreatorProject | null>;
  forkProject(id: string, userId: string): Promise<CreatorProject | null>;
  saveVersion(projectId: string, savedBy: string, label?: string): Promise<CreatorVersion>;
  restoreVersion(projectId: string, versionId: string): Promise<CreatorProject | null>;
  favoriteProject(projectId: string, userId: string): Promise<CreatorFavorite>;
  unfavoriteProject(projectId: string, userId: string): Promise<boolean>;
  isFavorited(projectId: string, userId: string): Promise<boolean>;
  searchProjects(query: string, opts?: ListProjectsOptions): Promise<CreatorProject[]>;
  listProjects(opts?: ListProjectsOptions): Promise<CreatorProject[]>;
  listPublicProjects(limit?: number, offset?: number): Promise<CreatorProject[]>;
  getProjectById(id: string): Promise<CreatorProject | null>;
  getTemplates(): Promise<CreatorTemplate[]>;
  uploadAsset(input: UploadAssetInput): Promise<CreatorAsset>;
  getAssets(ownerId: string, projectId?: string): Promise<CreatorAsset[]>;
  addMember(projectId: string, userId: string, role?: MemberRole): Promise<CreatorMember>;
  removeMember(projectId: string, userId: string): Promise<boolean>;
  getMembers(projectId: string): Promise<CreatorMember[]>;
  addComment(projectId: string, userId: string, content: string): Promise<CreatorComment>;
  getComments(projectId: string): Promise<CreatorComment[]>;
  getFavorites(userId: string): Promise<CreatorProject[]>;
  getVersions(projectId: string): Promise<CreatorVersion[]>;
  dashboard(userId: string): Promise<CreatorDashboard>;
  getCategories(): Promise<CreatorCategory[]>;
  seedCategories(): Promise<void>;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toProject(row: CreatorProject): CreatorProject {
  return row;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class DrizzleCreatorRepository implements ICreatorRepository {

  // ── Projects ────────────────────────────────────────────────────────────────

  async createProject(input: CreateProjectInput): Promise<CreatorProject> {
    const [row] = await db.insert(creatorProjectsTable).values({
      id:          createId(),
      name:        input.name,
      description: input.description,
      type:        (input.type ?? "WORLD") as never,
      status:      "DRAFT" as never,
      ownerId:     input.ownerId,
      templateId:  input.templateId,
      forkedFrom:  input.forkedFrom,
      categoryId:  input.categoryId,
      thumbnail:   input.thumbnail,
      content:     input.content ?? {},
      tags:        input.tags ?? [],
      metadata:    input.metadata ?? {},
      isPublic:    false,
      viewCount:   0,
      forkCount:   0,
      likeCount:   0,
      createdAt:   new Date(),
      updatedAt:   new Date(),
    }).returning();
    return toProject(row!);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<CreatorProject | null> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name        !== undefined) set["name"]        = input.name;
    if (input.description !== undefined) set["description"] = input.description;
    if (input.status      !== undefined) set["status"]      = input.status;
    if (input.thumbnail   !== undefined) set["thumbnail"]   = input.thumbnail;
    if (input.content     !== undefined) set["content"]     = input.content;
    if (input.tags        !== undefined) set["tags"]        = input.tags;
    if (input.isPublic    !== undefined) set["isPublic"]    = input.isPublic;
    if (input.metadata    !== undefined) set["metadata"]    = input.metadata;
    const [row] = await db.update(creatorProjectsTable)
      .set(set as never)
      .where(eq(creatorProjectsTable.id, id))
      .returning();
    return row ? toProject(row) : null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(creatorProjectsTable)
      .where(eq(creatorProjectsTable.id, id))
      .returning();
    return result.length > 0;
  }

  async publishProject(id: string, publishedBy: string, notes?: string): Promise<CreatorProject | null> {
    const existing = await this.getProjectById(id);
    if (!existing) return null;
    const versions = await this.getVersions(id);
    const nextVersion = (versions[0]?.version ?? 0) + 1;
    await db.insert(creatorPublishLogsTable).values({
      id:          createId(),
      projectId:   id,
      publishedBy,
      version:     nextVersion,
      notes:       notes ?? null,
      status:      "SUCCESS",
      createdAt:   new Date(),
    });
    const [row] = await db.update(creatorProjectsTable)
      .set({
        status:      "PUBLISHED" as never,
        isPublic:    true,
        publishedAt: new Date(),
        updatedAt:   new Date(),
      })
      .where(eq(creatorProjectsTable.id, id))
      .returning();
    return row ? toProject(row) : null;
  }

  async forkProject(id: string, userId: string): Promise<CreatorProject | null> {
    const original = await this.getProjectById(id);
    if (!original) return null;
    const forked = await this.createProject({
      name:       `${original.name} (Fork)`,
      description: original.description ?? undefined,
      type:       (original.type ?? "WORLD") as ProjectType,
      ownerId:    userId,
      forkedFrom: id,
      content:    (original.content as Record<string, unknown>) ?? {},
      tags:       (original.tags as string[]) ?? [],
      metadata:   (original.metadata as Record<string, unknown>) ?? {},
    });
    await db.update(creatorProjectsTable)
      .set({ forkCount: sql`${creatorProjectsTable.forkCount} + 1`, updatedAt: new Date() })
      .where(eq(creatorProjectsTable.id, id));
    return forked;
  }

  async saveVersion(projectId: string, savedBy: string, label?: string): Promise<CreatorVersion> {
    const project = await this.getProjectById(projectId);
    const versions = await this.getVersions(projectId);
    const nextVersion = (versions[0]?.version ?? 0) + 1;
    const [row] = await db.insert(creatorVersionsTable).values({
      id:        createId(),
      projectId,
      version:   nextVersion,
      label:     label ?? null,
      content:   (project?.content as Record<string, unknown>) ?? {},
      savedBy,
      createdAt: new Date(),
    }).returning();
    return row!;
  }

  async restoreVersion(projectId: string, versionId: string): Promise<CreatorProject | null> {
    const [ver] = await db.select().from(creatorVersionsTable)
      .where(and(eq(creatorVersionsTable.id, versionId), eq(creatorVersionsTable.projectId, projectId)));
    if (!ver) return null;
    return this.updateProject(projectId, { content: (ver.content as Record<string, unknown>) ?? {} });
  }

  async getVersions(projectId: string): Promise<CreatorVersion[]> {
    return db.select().from(creatorVersionsTable)
      .where(eq(creatorVersionsTable.projectId, projectId))
      .orderBy(desc(creatorVersionsTable.version));
  }

  // ── Favorites ───────────────────────────────────────────────────────────────

  async favoriteProject(projectId: string, userId: string): Promise<CreatorFavorite> {
    const existing = await db.select().from(creatorFavoritesTable)
      .where(and(eq(creatorFavoritesTable.projectId, projectId), eq(creatorFavoritesTable.userId, userId)));
    if (existing[0]) return existing[0];
    const [row] = await db.insert(creatorFavoritesTable).values({
      id: createId(), projectId, userId, createdAt: new Date(),
    }).returning();
    await db.update(creatorProjectsTable)
      .set({ likeCount: sql`${creatorProjectsTable.likeCount} + 1` })
      .where(eq(creatorProjectsTable.id, projectId));
    return row!;
  }

  async unfavoriteProject(projectId: string, userId: string): Promise<boolean> {
    const result = await db.delete(creatorFavoritesTable)
      .where(and(eq(creatorFavoritesTable.projectId, projectId), eq(creatorFavoritesTable.userId, userId)))
      .returning();
    if (result.length > 0) {
      await db.update(creatorProjectsTable)
        .set({ likeCount: sql`GREATEST(${creatorProjectsTable.likeCount} - 1, 0)` })
        .where(eq(creatorProjectsTable.id, projectId));
    }
    return result.length > 0;
  }

  async isFavorited(projectId: string, userId: string): Promise<boolean> {
    const rows = await db.select().from(creatorFavoritesTable)
      .where(and(eq(creatorFavoritesTable.projectId, projectId), eq(creatorFavoritesTable.userId, userId)));
    return rows.length > 0;
  }

  async getFavorites(userId: string): Promise<CreatorProject[]> {
    const favs = await db.select().from(creatorFavoritesTable)
      .where(eq(creatorFavoritesTable.userId, userId))
      .orderBy(desc(creatorFavoritesTable.createdAt));
    if (favs.length === 0) return [];
    const ids = favs.map(f => f.projectId);
    const rows = await db.select().from(creatorProjectsTable)
      .where(inArray(creatorProjectsTable.id, ids));
    return rows.map(toProject);
  }

  // ── Search & List ────────────────────────────────────────────────────────────

  async searchProjects(query: string, opts?: ListProjectsOptions): Promise<CreatorProject[]> {
    const conditions = [
      or(
        ilike(creatorProjectsTable.name, `%${query}%`),
        ilike(creatorProjectsTable.description, `%${query}%`),
      ),
    ];
    if (opts?.ownerId)  conditions.push(eq(creatorProjectsTable.ownerId, opts.ownerId));
    if (opts?.type)     conditions.push(sql`${creatorProjectsTable.type} = ${opts.type}`);
    if (opts?.status)   conditions.push(sql`${creatorProjectsTable.status} = ${opts.status}`);
    if (opts?.isPublic !== undefined) conditions.push(eq(creatorProjectsTable.isPublic, opts.isPublic));
    const rows = await db.select().from(creatorProjectsTable)
      .where(and(...conditions))
      .orderBy(desc(creatorProjectsTable.updatedAt))
      .limit(opts?.limit ?? 20)
      .offset(opts?.offset ?? 0);
    return rows.map(toProject);
  }

  async listProjects(opts?: ListProjectsOptions): Promise<CreatorProject[]> {
    const conditions = [];
    if (opts?.ownerId)  conditions.push(eq(creatorProjectsTable.ownerId, opts.ownerId));
    if (opts?.type)     conditions.push(sql`${creatorProjectsTable.type} = ${opts.type}`);
    if (opts?.status)   conditions.push(sql`${creatorProjectsTable.status} = ${opts.status}`);
    if (opts?.isPublic !== undefined) conditions.push(eq(creatorProjectsTable.isPublic, opts.isPublic));
    const rows = await db.select().from(creatorProjectsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(creatorProjectsTable.updatedAt))
      .limit(opts?.limit ?? 20)
      .offset(opts?.offset ?? 0);
    return rows.map(toProject);
  }

  async listPublicProjects(limit = 20, offset = 0): Promise<CreatorProject[]> {
    const rows = await db.select().from(creatorProjectsTable)
      .where(and(
        eq(creatorProjectsTable.isPublic, true),
        sql`${creatorProjectsTable.status} = 'PUBLISHED'`,
      ))
      .orderBy(desc(creatorProjectsTable.viewCount))
      .limit(limit)
      .offset(offset);
    return rows.map(toProject);
  }

  async getProjectById(id: string): Promise<CreatorProject | null> {
    const [row] = await db.select().from(creatorProjectsTable)
      .where(eq(creatorProjectsTable.id, id));
    if (!row) return null;
    await db.update(creatorProjectsTable)
      .set({ viewCount: sql`${creatorProjectsTable.viewCount} + 1` })
      .where(eq(creatorProjectsTable.id, id));
    return toProject(row);
  }

  // ── Templates ────────────────────────────────────────────────────────────────

  async getTemplates(): Promise<CreatorTemplate[]> {
    return db.select().from(creatorTemplatesTable)
      .orderBy(desc(creatorTemplatesTable.useCount));
  }

  // ── Assets ───────────────────────────────────────────────────────────────────

  async uploadAsset(input: UploadAssetInput): Promise<CreatorAsset> {
    const [row] = await db.insert(creatorAssetsTable).values({
      id:        createId(),
      ownerId:   input.ownerId,
      projectId: input.projectId ?? null,
      name:      input.name,
      type:      input.type as never,
      url:       input.url,
      size:      input.size ?? 0,
      mimeType:  input.mimeType ?? null,
      metadata:  input.metadata ?? {},
      createdAt: new Date(),
    }).returning();
    return row!;
  }

  async getAssets(ownerId: string, projectId?: string): Promise<CreatorAsset[]> {
    const conditions = [eq(creatorAssetsTable.ownerId, ownerId)];
    if (projectId) conditions.push(eq(creatorAssetsTable.projectId, projectId));
    return db.select().from(creatorAssetsTable)
      .where(and(...conditions))
      .orderBy(desc(creatorAssetsTable.createdAt));
  }

  // ── Members ──────────────────────────────────────────────────────────────────

  async addMember(projectId: string, userId: string, role: MemberRole = "VIEWER"): Promise<CreatorMember> {
    const existing = await db.select().from(creatorProjectMembersTable)
      .where(and(eq(creatorProjectMembersTable.projectId, projectId), eq(creatorProjectMembersTable.userId, userId)));
    if (existing[0]) return existing[0];
    const [row] = await db.insert(creatorProjectMembersTable).values({
      id: createId(), projectId, userId, role: role as never, joinedAt: new Date(),
    }).returning();
    return row!;
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    const result = await db.delete(creatorProjectMembersTable)
      .where(and(eq(creatorProjectMembersTable.projectId, projectId), eq(creatorProjectMembersTable.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getMembers(projectId: string): Promise<CreatorMember[]> {
    return db.select().from(creatorProjectMembersTable)
      .where(eq(creatorProjectMembersTable.projectId, projectId))
      .orderBy(creatorProjectMembersTable.joinedAt);
  }

  // ── Comments ─────────────────────────────────────────────────────────────────

  async addComment(projectId: string, userId: string, content: string): Promise<CreatorComment> {
    const [row] = await db.insert(creatorCommentsTable).values({
      id: createId(), projectId, userId, content, createdAt: new Date(), updatedAt: new Date(),
    }).returning();
    return row!;
  }

  async getComments(projectId: string): Promise<CreatorComment[]> {
    return db.select().from(creatorCommentsTable)
      .where(eq(creatorCommentsTable.projectId, projectId))
      .orderBy(desc(creatorCommentsTable.createdAt));
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async dashboard(userId: string): Promise<CreatorDashboard> {
    const projects = await this.listProjects({ ownerId: userId, limit: 10 });
    const allProjects = await this.listProjects({ ownerId: userId, limit: 100 });
    const published = allProjects.filter(p => p.status === "PUBLISHED").length;
    const assets = await this.getAssets(userId);
    const favs = await this.getFavorites(userId);
    const totalViews = allProjects.reduce((s, p) => s + p.viewCount, 0);
    return {
      projects,
      published,
      assets:       assets.length,
      favorites:    favs.length,
      totalViews,
      recentActivity: projects.slice(0, 5),
    };
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  async getCategories(): Promise<CreatorCategory[]> {
    return db.select().from(creatorCategoriesTable).orderBy(creatorCategoriesTable.name);
  }

  async seedCategories(): Promise<void> {
    const seeds = [
      { name: "Thế giới", slug: "world", description: "Tạo và xây dựng thế giới", icon: "🌍" },
      { name: "Nhiệm vụ", slug: "quest", description: "Thiết kế nhiệm vụ và cốt truyện", icon: "📜" },
      { name: "Kinh doanh", slug: "business", description: "Mô hình kinh doanh trong game", icon: "🏪" },
      { name: "Sự kiện", slug: "event", description: "Tổ chức sự kiện cộng đồng", icon: "🎪" },
      { name: "Nhân vật", slug: "npc", description: "Thiết kế NPC và nhân vật", icon: "🤖" },
      { name: "Cửa hàng", slug: "shop", description: "Xây dựng cửa hàng và marketplace", icon: "🛒" },
    ];
    for (const s of seeds) {
      const exists = await db.select().from(creatorCategoriesTable)
        .where(eq(creatorCategoriesTable.slug, s.slug));
      if (exists.length === 0) {
        await db.insert(creatorCategoriesTable).values({ id: createId(), ...s, createdAt: new Date() });
      }
    }
  }
}
