import { eq, desc } from "drizzle-orm";
import { db, applicationsRegistryTable } from "@workspace/db";
import type { IApplicationRegistryRepository } from "../applicationRegistryRepository";
import type { Application, AppHUB5Category, AppHUB5Status, PaginationOptions } from "../../models/application";

function rowToApp(row: typeof applicationsRegistryTable.$inferSelect): Application {
  return {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    description: row.description ?? undefined,
    iconUrl:     row.iconUrl ?? undefined,
    bannerUrl:   row.bannerUrl ?? undefined,
    category:    row.category as AppHUB5Category,
    launchUrl:   row.launchUrl,
    ownerApp:    row.ownerApp ?? undefined,
    status:      row.status as AppHUB5Status,
    featured:    row.featured,
    createdAt:   typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt!).toISOString(),
    updatedAt:   typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt!).toISOString(),
  };
}

function applyPagination<T>(arr: T[], opts?: PaginationOptions): T[] {
  const page  = Math.max(1, opts?.page  ?? 1);
  const limit = Math.max(1, opts?.limit ?? 20);
  return arr.slice((page - 1) * limit, (page - 1) * limit + limit);
}

export class DrizzleApplicationRegistryRepository implements IApplicationRegistryRepository {
  async create(app: Application): Promise<Application> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(applicationsRegistryTable)
      .values({
        id:          app.id,
        slug:        app.slug,
        name:        app.name,
        description: app.description ?? null,
        iconUrl:     app.iconUrl ?? null,
        bannerUrl:   app.bannerUrl ?? null,
        category:    app.category,
        launchUrl:   app.launchUrl,
        ownerApp:    app.ownerApp ?? null,
        status:      app.status,
        featured:    app.featured,
        createdAt:   app.createdAt ?? now,
        updatedAt:   now,
      })
      .onConflictDoUpdate({
        target: applicationsRegistryTable.id,
        set: {
          name:        app.name,
          description: app.description ?? null,
          iconUrl:     app.iconUrl ?? null,
          bannerUrl:   app.bannerUrl ?? null,
          category:    app.category,
          launchUrl:   app.launchUrl,
          ownerApp:    app.ownerApp ?? null,
          status:      app.status,
          featured:    app.featured,
          updatedAt:   now,
        },
      })
      .returning();
    return rowToApp(inserted!);
  }

  async update(app: Application): Promise<Application | null> {
    const [updated] = await db
      .update(applicationsRegistryTable)
      .set({
        name:        app.name,
        description: app.description ?? null,
        iconUrl:     app.iconUrl ?? null,
        bannerUrl:   app.bannerUrl ?? null,
        category:    app.category,
        launchUrl:   app.launchUrl,
        ownerApp:    app.ownerApp ?? null,
        status:      app.status,
        featured:    app.featured,
        updatedAt:   new Date().toISOString(),
      })
      .where(eq(applicationsRegistryTable.id, app.id))
      .returning();
    return updated ? rowToApp(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(applicationsRegistryTable).where(eq(applicationsRegistryTable.id, id)).returning();
    return result.length > 0;
  }

  async findById(id: string): Promise<Application | null> {
    const rows = await db.select().from(applicationsRegistryTable).where(eq(applicationsRegistryTable.id, id)).limit(1);
    return rows[0] ? rowToApp(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Application | null> {
    const rows = await db.select().from(applicationsRegistryTable).where(eq(applicationsRegistryTable.slug, slug)).limit(1);
    return rows[0] ? rowToApp(rows[0]) : null;
  }

  async findAll(opts?: PaginationOptions): Promise<Application[]> {
    const rows = await db.select().from(applicationsRegistryTable).orderBy(desc(applicationsRegistryTable.createdAt));
    return applyPagination(rows.map(rowToApp), opts);
  }

  async findByCategory(category: AppHUB5Category, opts?: PaginationOptions): Promise<Application[]> {
    const rows = await db.select().from(applicationsRegistryTable).where(eq(applicationsRegistryTable.category, category)).orderBy(desc(applicationsRegistryTable.createdAt));
    return applyPagination(rows.map(rowToApp), opts);
  }

  async findFeatured(opts?: PaginationOptions): Promise<Application[]> {
    const rows = await db.select().from(applicationsRegistryTable).where(eq(applicationsRegistryTable.featured, true)).orderBy(desc(applicationsRegistryTable.createdAt));
    return applyPagination(rows.map(rowToApp), opts);
  }

  async findRecentlyAdded(limit: number): Promise<Application[]> {
    const rows = await db.select().from(applicationsRegistryTable).orderBy(desc(applicationsRegistryTable.createdAt)).limit(limit);
    return rows.map(rowToApp);
  }

  async updateStatus(id: string, status: AppHUB5Status): Promise<Application | null> {
    const [updated] = await db
      .update(applicationsRegistryTable)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(applicationsRegistryTable.id, id))
      .returning();
    return updated ? rowToApp(updated) : null;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const rows = await db.select({ id: applicationsRegistryTable.id }).from(applicationsRegistryTable).where(eq(applicationsRegistryTable.slug, slug)).limit(1);
    return rows.length > 0;
  }

  async count(): Promise<number> {
    const rows = await db.select({ id: applicationsRegistryTable.id }).from(applicationsRegistryTable);
    return rows.length;
  }
}
