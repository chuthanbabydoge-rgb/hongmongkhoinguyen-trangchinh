import { eq } from "drizzle-orm";
import { db, ecosystemAppsTable } from "@workspace/db";
import type { IAppRegistryRepository } from "../appRegistryRepository";
import type { EcosystemApp, AppCategory } from "../../models/appRegistry";

function rowToApp(row: typeof ecosystemAppsTable.$inferSelect): EcosystemApp {
  return {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    description: row.description ?? undefined,
    icon:        row.iconUrl ?? undefined,
    url:         row.baseUrl,
    category:    row.category as AppCategory,
    status:      row.status as EcosystemApp["status"],
    version:     row.version,
    createdAt:   typeof row.createdAt === "string" ? row.createdAt : new Date(row.createdAt!).toISOString(),
    updatedAt:   typeof row.updatedAt === "string" ? row.updatedAt : new Date(row.updatedAt!).toISOString(),
  };
}

export class DrizzleAppRegistryRepository implements IAppRegistryRepository {
  async create(app: EcosystemApp): Promise<EcosystemApp> {
    const now = new Date().toISOString();
    const [inserted] = await db
      .insert(ecosystemAppsTable)
      .values({
        id:          app.id,
        slug:        app.slug,
        name:        app.name,
        description: app.description ?? null,
        iconUrl:     app.icon ?? null,
        baseUrl:     app.url ?? "",
        category:    app.category,
        status:      app.status,
        version:     app.version,
        createdAt:   app.createdAt ?? now,
        updatedAt:   now,
      })
      .onConflictDoUpdate({
        target: ecosystemAppsTable.id,
        set: {
          name:        app.name,
          description: app.description ?? null,
          iconUrl:     app.icon ?? null,
          baseUrl:     app.url ?? "",
          category:    app.category,
          status:      app.status,
          version:     app.version,
          updatedAt:   now,
        },
      })
      .returning();
    return rowToApp(inserted!);
  }

  async update(app: EcosystemApp): Promise<EcosystemApp | null> {
    const [updated] = await db
      .update(ecosystemAppsTable)
      .set({
        name:        app.name,
        description: app.description ?? null,
        iconUrl:     app.icon ?? null,
        baseUrl:     app.url ?? "",
        category:    app.category,
        status:      app.status,
        version:     app.version,
        updatedAt:   new Date().toISOString(),
      })
      .where(eq(ecosystemAppsTable.id, app.id))
      .returning();
    return updated ? rowToApp(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(ecosystemAppsTable).where(eq(ecosystemAppsTable.id, id)).returning();
    return result.length > 0;
  }

  async findById(id: string): Promise<EcosystemApp | null> {
    const rows = await db.select().from(ecosystemAppsTable).where(eq(ecosystemAppsTable.id, id)).limit(1);
    return rows[0] ? rowToApp(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<EcosystemApp | null> {
    const rows = await db.select().from(ecosystemAppsTable).where(eq(ecosystemAppsTable.slug, slug)).limit(1);
    return rows[0] ? rowToApp(rows[0]) : null;
  }

  async findAll(): Promise<EcosystemApp[]> {
    const rows = await db.select().from(ecosystemAppsTable);
    return rows.map(rowToApp);
  }

  async findByCategory(category: AppCategory): Promise<EcosystemApp[]> {
    const rows = await db.select().from(ecosystemAppsTable).where(eq(ecosystemAppsTable.category, category));
    return rows.map(rowToApp);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const rows = await db.select({ id: ecosystemAppsTable.id }).from(ecosystemAppsTable).where(eq(ecosystemAppsTable.slug, slug)).limit(1);
    return rows.length > 0;
  }

  async count(): Promise<number> {
    const rows = await db.select({ id: ecosystemAppsTable.id }).from(ecosystemAppsTable);
    return rows.length;
  }
}
