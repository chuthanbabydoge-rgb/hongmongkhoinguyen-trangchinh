// ─────────────────────────────────────────────────────────────────────────────
// DrizzleBusinessRepository — HUB-27
// ─────────────────────────────────────────────────────────────────────────────

import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@workspace/db";
import {
  businessCategoriesTable, companiesTable, companyProfilesTable, companyMembersTable,
  companyDepartmentsTable, companyPositionsTable, employeesTable, employeeContractsTable,
  payrollsTable, salariesTable, storesTable, warehousesTable, warehouseItemsTable,
  factoriesTable, factoryRecipesTable, brandsTable, productsTable, businessAssetsTable,
  businessTransactionsTable, businessInvoicesTable, businessLogsTable,
  businessStatisticsTable, businessReviewsTable, companyFollowersTable, companySettingsTable,
  type BusinessCategory, type Company, type CompanyProfile, type CompanyMember,
  type CompanyDepartment, type CompanyPosition, type Employee, type EmployeeContract,
  type Payroll, type Salary, type Store, type Warehouse, type WarehouseItem,
  type Factory, type FactoryRecipe, type Brand, type Product, type BusinessAsset,
  type BusinessTransaction, type BusinessInvoice, type BusinessLog, type BusinessStatistic,
  type BusinessReview, type CompanyFollower, type CompanySetting,
} from "@workspace/db/schema";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IBusinessRepository {
  // Categories
  listCategories(): Promise<BusinessCategory[]>;
  createCategory(input: Omit<BusinessCategory, "id" | "createdAt">): Promise<BusinessCategory>;

  // Companies
  listCompanies(opts?: { search?: string; status?: string; limit?: number; offset?: number }): Promise<Company[]>;
  getCompany(id: string): Promise<Company | null>;
  getCompanyBySlug(slug: string): Promise<Company | null>;
  getCompaniesByOwner(ownerId: string): Promise<Company[]>;
  createCompany(input: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company>;
  updateCompany(id: string, input: Partial<Company>): Promise<Company | null>;
  deleteCompany(id: string): Promise<boolean>;
  countCompanies(): Promise<number>;

  // Company Profiles
  getCompanyProfile(companyId: string): Promise<CompanyProfile | null>;
  upsertCompanyProfile(companyId: string, input: Partial<CompanyProfile>): Promise<CompanyProfile>;

  // Company Members
  listMembers(companyId: string): Promise<CompanyMember[]>;
  getMember(id: string): Promise<CompanyMember | null>;
  addMember(input: Omit<CompanyMember, "id" | "joinedAt">): Promise<CompanyMember>;
  removeMember(id: string): Promise<boolean>;

  // Departments
  listDepartments(companyId: string): Promise<CompanyDepartment[]>;
  getDepartment(id: string): Promise<CompanyDepartment | null>;
  createDepartment(input: Omit<CompanyDepartment, "id" | "createdAt" | "updatedAt">): Promise<CompanyDepartment>;
  updateDepartment(id: string, input: Partial<CompanyDepartment>): Promise<CompanyDepartment | null>;
  deleteDepartment(id: string): Promise<boolean>;
  countDepartments(): Promise<number>;

  // Positions
  listPositions(companyId: string, departmentId?: string): Promise<CompanyPosition[]>;
  getPosition(id: string): Promise<CompanyPosition | null>;
  createPosition(input: Omit<CompanyPosition, "id" | "createdAt">): Promise<CompanyPosition>;
  updatePosition(id: string, input: Partial<CompanyPosition>): Promise<CompanyPosition | null>;

  // Employees
  listEmployees(opts?: { companyId?: string; departmentId?: string; status?: string; search?: string; limit?: number; offset?: number }): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | null>;
  hireEmployee(input: Omit<Employee, "id" | "createdAt" | "updatedAt">): Promise<Employee>;
  updateEmployee(id: string, input: Partial<Employee>): Promise<Employee | null>;
  fireEmployee(id: string): Promise<Employee | null>;
  countEmployees(companyId?: string): Promise<number>;

  // Contracts
  listContracts(employeeId: string): Promise<EmployeeContract[]>;
  getContract(id: string): Promise<EmployeeContract | null>;
  createContract(input: Omit<EmployeeContract, "id" | "createdAt">): Promise<EmployeeContract>;
  updateContract(id: string, input: Partial<EmployeeContract>): Promise<EmployeeContract | null>;

  // Payrolls
  listPayrolls(companyId: string, opts?: { status?: string; limit?: number }): Promise<Payroll[]>;
  getPayroll(id: string): Promise<Payroll | null>;
  createPayroll(input: Omit<Payroll, "id" | "createdAt" | "updatedAt">): Promise<Payroll>;
  updatePayroll(id: string, input: Partial<Payroll>): Promise<Payroll | null>;
  countPayrolls(): Promise<number>;

  // Salaries
  listSalaries(payrollId: string): Promise<Salary[]>;
  createSalary(input: Omit<Salary, "id" | "createdAt">): Promise<Salary>;
  updateSalary(id: string, input: Partial<Salary>): Promise<Salary | null>;

  // Stores
  listStores(companyId?: string, opts?: { search?: string; limit?: number; offset?: number }): Promise<Store[]>;
  getStore(id: string): Promise<Store | null>;
  createStore(input: Omit<Store, "id" | "createdAt" | "updatedAt">): Promise<Store>;
  updateStore(id: string, input: Partial<Store>): Promise<Store | null>;
  countStores(): Promise<number>;

  // Warehouses
  listWarehouses(companyId?: string): Promise<Warehouse[]>;
  getWarehouse(id: string): Promise<Warehouse | null>;
  createWarehouse(input: Omit<Warehouse, "id" | "createdAt" | "updatedAt">): Promise<Warehouse>;
  updateWarehouse(id: string, input: Partial<Warehouse>): Promise<Warehouse | null>;
  countWarehouses(): Promise<number>;

  // Warehouse Items
  listWarehouseItems(warehouseId: string): Promise<WarehouseItem[]>;
  getWarehouseItem(id: string): Promise<WarehouseItem | null>;
  upsertWarehouseItem(input: Omit<WarehouseItem, "id" | "createdAt" | "updatedAt">): Promise<WarehouseItem>;
  updateWarehouseItem(id: string, input: Partial<WarehouseItem>): Promise<WarehouseItem | null>;

  // Factories
  listFactories(companyId?: string): Promise<Factory[]>;
  getFactory(id: string): Promise<Factory | null>;
  createFactory(input: Omit<Factory, "id" | "createdAt" | "updatedAt">): Promise<Factory>;
  updateFactory(id: string, input: Partial<Factory>): Promise<Factory | null>;
  countFactories(): Promise<number>;

  // Factory Recipes
  listRecipes(factoryId: string): Promise<FactoryRecipe[]>;
  getRecipe(id: string): Promise<FactoryRecipe | null>;
  createRecipe(input: Omit<FactoryRecipe, "id" | "createdAt" | "updatedAt">): Promise<FactoryRecipe>;
  updateRecipe(id: string, input: Partial<FactoryRecipe>): Promise<FactoryRecipe | null>;

  // Brands
  listBrands(companyId?: string, opts?: { search?: string; limit?: number; offset?: number }): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | null>;
  createBrand(input: Omit<Brand, "id" | "createdAt" | "updatedAt">): Promise<Brand>;
  updateBrand(id: string, input: Partial<Brand>): Promise<Brand | null>;
  countBrands(): Promise<number>;

  // Products
  listProducts(opts?: { companyId?: string; brandId?: string; storeId?: string; search?: string; limit?: number; offset?: number }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  updateProduct(id: string, input: Partial<Product>): Promise<Product | null>;
  countProducts(): Promise<number>;

  // Assets
  listAssets(companyId: string): Promise<BusinessAsset[]>;
  createAsset(input: Omit<BusinessAsset, "id" | "createdAt" | "updatedAt">): Promise<BusinessAsset>;
  updateAsset(id: string, input: Partial<BusinessAsset>): Promise<BusinessAsset | null>;

  // Transactions
  listTransactions(companyId: string, opts?: { type?: string; limit?: number; offset?: number }): Promise<BusinessTransaction[]>;
  createTransaction(input: Omit<BusinessTransaction, "id" | "createdAt">): Promise<BusinessTransaction>;
  countTransactions(): Promise<number>;

  // Invoices
  listInvoices(companyId: string, opts?: { status?: string; limit?: number }): Promise<BusinessInvoice[]>;
  getInvoice(id: string): Promise<BusinessInvoice | null>;
  createInvoice(input: Omit<BusinessInvoice, "id" | "createdAt" | "updatedAt">): Promise<BusinessInvoice>;
  updateInvoice(id: string, input: Partial<BusinessInvoice>): Promise<BusinessInvoice | null>;

  // Logs
  listLogs(companyId: string, limit?: number): Promise<BusinessLog[]>;
  createLog(input: Omit<BusinessLog, "id" | "createdAt">): Promise<BusinessLog>;

  // Statistics
  getStatistics(companyId: string): Promise<BusinessStatistic | null>;
  upsertStatistics(companyId: string, input: Partial<BusinessStatistic>): Promise<BusinessStatistic>;
  getGlobalStats(): Promise<{ totalCompanies: number; totalEmployees: number; totalRevenue: number; totalStores: number; totalFactories: number; totalWarehouses: number }>;

  // Reviews
  listReviews(companyId: string): Promise<BusinessReview[]>;
  createReview(input: Omit<BusinessReview, "id" | "createdAt" | "updatedAt">): Promise<BusinessReview>;

  // Followers
  listFollowers(companyId: string): Promise<CompanyFollower[]>;
  isFollowing(companyId: string, userId: string): Promise<boolean>;
  follow(companyId: string, userId: string): Promise<CompanyFollower>;
  unfollow(companyId: string, userId: string): Promise<boolean>;

  // Settings
  getSettings(companyId: string): Promise<CompanySetting | null>;
  upsertSettings(companyId: string, input: Partial<CompanySetting>): Promise<CompanySetting>;

  // Seed
  seedData(): Promise<void>;
}

// ─── Implementation ───────────────────────────────────────────────────────────

export class DrizzleBusinessRepository implements IBusinessRepository {

  // ── Categories ─────────────────────────────────────────────────────────────

  async listCategories() {
    return db.select().from(businessCategoriesTable).orderBy(businessCategoriesTable.name);
  }

  async createCategory(input: Omit<BusinessCategory, "id" | "createdAt">) {
    const [row] = await db.insert(businessCategoriesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  // ── Companies ──────────────────────────────────────────────────────────────

  async listCompanies(opts: { search?: string; status?: string; limit?: number; offset?: number } = {}) {
    const { search, status, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (search) conditions.push(ilike(companiesTable.name, `%${search}%`));
    if (status) conditions.push(eq(companiesTable.status, status as never));
    const q = db.select().from(companiesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(companiesTable.createdAt))
      .limit(limit)
      .offset(offset);
    return q;
  }

  async getCompany(id: string) {
    const [row] = await db.select().from(companiesTable).where(eq(companiesTable.id, id)).limit(1);
    return row ?? null;
  }

  async getCompanyBySlug(slug: string) {
    const [row] = await db.select().from(companiesTable).where(eq(companiesTable.slug, slug)).limit(1);
    return row ?? null;
  }

  async getCompaniesByOwner(ownerId: string) {
    return db.select().from(companiesTable).where(eq(companiesTable.ownerId, ownerId)).orderBy(desc(companiesTable.createdAt));
  }

  async createCompany(input: Omit<Company, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(companiesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateCompany(id: string, input: Partial<Company>) {
    const [row] = await db.update(companiesTable).set({ ...input, updatedAt: new Date() }).where(eq(companiesTable.id, id)).returning();
    return row ?? null;
  }

  async deleteCompany(id: string) {
    const [row] = await db.delete(companiesTable).where(eq(companiesTable.id, id)).returning();
    return !!row;
  }

  async countCompanies() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(companiesTable);
    return row?.count ?? 0;
  }

  // ── Company Profiles ───────────────────────────────────────────────────────

  async getCompanyProfile(companyId: string) {
    const [row] = await db.select().from(companyProfilesTable).where(eq(companyProfilesTable.companyId, companyId)).limit(1);
    return row ?? null;
  }

  async upsertCompanyProfile(companyId: string, input: Partial<CompanyProfile>) {
    const existing = await this.getCompanyProfile(companyId);
    if (existing) {
      const [row] = await db.update(companyProfilesTable).set({ ...input, updatedAt: new Date() }).where(eq(companyProfilesTable.companyId, companyId)).returning();
      return row!;
    }
    const [row] = await db.insert(companyProfilesTable).values({ id: createId(), companyId, ...input }).returning();
    return row!;
  }

  // ── Members ────────────────────────────────────────────────────────────────

  async listMembers(companyId: string) {
    return db.select().from(companyMembersTable).where(eq(companyMembersTable.companyId, companyId));
  }

  async getMember(id: string) {
    const [row] = await db.select().from(companyMembersTable).where(eq(companyMembersTable.id, id)).limit(1);
    return row ?? null;
  }

  async addMember(input: Omit<CompanyMember, "id" | "joinedAt">) {
    const [row] = await db.insert(companyMembersTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async removeMember(id: string) {
    const [row] = await db.delete(companyMembersTable).where(eq(companyMembersTable.id, id)).returning();
    return !!row;
  }

  // ── Departments ────────────────────────────────────────────────────────────

  async listDepartments(companyId: string) {
    return db.select().from(companyDepartmentsTable).where(eq(companyDepartmentsTable.companyId, companyId)).orderBy(companyDepartmentsTable.name);
  }

  async getDepartment(id: string) {
    const [row] = await db.select().from(companyDepartmentsTable).where(eq(companyDepartmentsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createDepartment(input: Omit<CompanyDepartment, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(companyDepartmentsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateDepartment(id: string, input: Partial<CompanyDepartment>) {
    const [row] = await db.update(companyDepartmentsTable).set({ ...input, updatedAt: new Date() }).where(eq(companyDepartmentsTable.id, id)).returning();
    return row ?? null;
  }

  async deleteDepartment(id: string) {
    const [row] = await db.delete(companyDepartmentsTable).where(eq(companyDepartmentsTable.id, id)).returning();
    return !!row;
  }

  async countDepartments() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(companyDepartmentsTable);
    return row?.count ?? 0;
  }

  // ── Positions ──────────────────────────────────────────────────────────────

  async listPositions(companyId: string, departmentId?: string) {
    const conditions = [eq(companyPositionsTable.companyId, companyId)];
    if (departmentId) conditions.push(eq(companyPositionsTable.departmentId, departmentId));
    return db.select().from(companyPositionsTable).where(and(...conditions)).orderBy(companyPositionsTable.title);
  }

  async getPosition(id: string) {
    const [row] = await db.select().from(companyPositionsTable).where(eq(companyPositionsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createPosition(input: Omit<CompanyPosition, "id" | "createdAt">) {
    const [row] = await db.insert(companyPositionsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updatePosition(id: string, input: Partial<CompanyPosition>) {
    const [row] = await db.update(companyPositionsTable).set(input).where(eq(companyPositionsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Employees ──────────────────────────────────────────────────────────────

  async listEmployees(opts: { companyId?: string; departmentId?: string; status?: string; search?: string; limit?: number; offset?: number } = {}) {
    const { companyId, departmentId, status, search, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (companyId) conditions.push(eq(employeesTable.companyId, companyId));
    if (departmentId) conditions.push(eq(employeesTable.departmentId, departmentId));
    if (status) conditions.push(eq(employeesTable.employmentStatus, status as never));
    if (search) conditions.push(ilike(employeesTable.firstName, `%${search}%`));
    return db.select().from(employeesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(employeesTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getEmployee(id: string) {
    const [row] = await db.select().from(employeesTable).where(eq(employeesTable.id, id)).limit(1);
    return row ?? null;
  }

  async hireEmployee(input: Omit<Employee, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(employeesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateEmployee(id: string, input: Partial<Employee>) {
    const [row] = await db.update(employeesTable).set({ ...input, updatedAt: new Date() }).where(eq(employeesTable.id, id)).returning();
    return row ?? null;
  }

  async fireEmployee(id: string) {
    const [row] = await db.update(employeesTable).set({ employmentStatus: "TERMINATED", terminatedAt: new Date(), updatedAt: new Date() }).where(eq(employeesTable.id, id)).returning();
    return row ?? null;
  }

  async countEmployees(companyId?: string) {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(employeesTable)
      .where(companyId ? eq(employeesTable.companyId, companyId) : undefined);
    return row?.count ?? 0;
  }

  // ── Contracts ──────────────────────────────────────────────────────────────

  async listContracts(employeeId: string) {
    return db.select().from(employeeContractsTable).where(eq(employeeContractsTable.employeeId, employeeId)).orderBy(desc(employeeContractsTable.createdAt));
  }

  async getContract(id: string) {
    const [row] = await db.select().from(employeeContractsTable).where(eq(employeeContractsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createContract(input: Omit<EmployeeContract, "id" | "createdAt">) {
    const [row] = await db.insert(employeeContractsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateContract(id: string, input: Partial<EmployeeContract>) {
    const [row] = await db.update(employeeContractsTable).set(input).where(eq(employeeContractsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Payrolls ───────────────────────────────────────────────────────────────

  async listPayrolls(companyId: string, opts: { status?: string; limit?: number } = {}) {
    const { status, limit = 30 } = opts;
    const conditions = [eq(payrollsTable.companyId, companyId)];
    if (status) conditions.push(eq(payrollsTable.status, status as never));
    return db.select().from(payrollsTable).where(and(...conditions)).orderBy(desc(payrollsTable.createdAt)).limit(limit);
  }

  async getPayroll(id: string) {
    const [row] = await db.select().from(payrollsTable).where(eq(payrollsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createPayroll(input: Omit<Payroll, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(payrollsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updatePayroll(id: string, input: Partial<Payroll>) {
    const [row] = await db.update(payrollsTable).set({ ...input, updatedAt: new Date() }).where(eq(payrollsTable.id, id)).returning();
    return row ?? null;
  }

  async countPayrolls() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(payrollsTable);
    return row?.count ?? 0;
  }

  // ── Salaries ───────────────────────────────────────────────────────────────

  async listSalaries(payrollId: string) {
    return db.select().from(salariesTable).where(eq(salariesTable.payrollId, payrollId));
  }

  async createSalary(input: Omit<Salary, "id" | "createdAt">) {
    const [row] = await db.insert(salariesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateSalary(id: string, input: Partial<Salary>) {
    const [row] = await db.update(salariesTable).set(input).where(eq(salariesTable.id, id)).returning();
    return row ?? null;
  }

  // ── Stores ─────────────────────────────────────────────────────────────────

  async listStores(companyId?: string, opts: { search?: string; limit?: number; offset?: number } = {}) {
    const { search, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (companyId) conditions.push(eq(storesTable.companyId, companyId));
    if (search) conditions.push(ilike(storesTable.name, `%${search}%`));
    return db.select().from(storesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(storesTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getStore(id: string) {
    const [row] = await db.select().from(storesTable).where(eq(storesTable.id, id)).limit(1);
    return row ?? null;
  }

  async createStore(input: Omit<Store, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(storesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateStore(id: string, input: Partial<Store>) {
    const [row] = await db.update(storesTable).set({ ...input, updatedAt: new Date() }).where(eq(storesTable.id, id)).returning();
    return row ?? null;
  }

  async countStores() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(storesTable);
    return row?.count ?? 0;
  }

  // ── Warehouses ─────────────────────────────────────────────────────────────

  async listWarehouses(companyId?: string) {
    return db.select().from(warehousesTable)
      .where(companyId ? eq(warehousesTable.companyId, companyId) : undefined)
      .orderBy(desc(warehousesTable.createdAt));
  }

  async getWarehouse(id: string) {
    const [row] = await db.select().from(warehousesTable).where(eq(warehousesTable.id, id)).limit(1);
    return row ?? null;
  }

  async createWarehouse(input: Omit<Warehouse, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(warehousesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateWarehouse(id: string, input: Partial<Warehouse>) {
    const [row] = await db.update(warehousesTable).set({ ...input, updatedAt: new Date() }).where(eq(warehousesTable.id, id)).returning();
    return row ?? null;
  }

  async countWarehouses() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(warehousesTable);
    return row?.count ?? 0;
  }

  // ── Warehouse Items ────────────────────────────────────────────────────────

  async listWarehouseItems(warehouseId: string) {
    return db.select().from(warehouseItemsTable).where(eq(warehouseItemsTable.warehouseId, warehouseId)).orderBy(warehouseItemsTable.name);
  }

  async getWarehouseItem(id: string) {
    const [row] = await db.select().from(warehouseItemsTable).where(eq(warehouseItemsTable.id, id)).limit(1);
    return row ?? null;
  }

  async upsertWarehouseItem(input: Omit<WarehouseItem, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(warehouseItemsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateWarehouseItem(id: string, input: Partial<WarehouseItem>) {
    const [row] = await db.update(warehouseItemsTable).set({ ...input, updatedAt: new Date() }).where(eq(warehouseItemsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Factories ──────────────────────────────────────────────────────────────

  async listFactories(companyId?: string) {
    return db.select().from(factoriesTable)
      .where(companyId ? eq(factoriesTable.companyId, companyId) : undefined)
      .orderBy(desc(factoriesTable.createdAt));
  }

  async getFactory(id: string) {
    const [row] = await db.select().from(factoriesTable).where(eq(factoriesTable.id, id)).limit(1);
    return row ?? null;
  }

  async createFactory(input: Omit<Factory, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(factoriesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateFactory(id: string, input: Partial<Factory>) {
    const [row] = await db.update(factoriesTable).set({ ...input, updatedAt: new Date() }).where(eq(factoriesTable.id, id)).returning();
    return row ?? null;
  }

  async countFactories() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(factoriesTable);
    return row?.count ?? 0;
  }

  // ── Factory Recipes ────────────────────────────────────────────────────────

  async listRecipes(factoryId: string) {
    return db.select().from(factoryRecipesTable).where(eq(factoryRecipesTable.factoryId, factoryId));
  }

  async getRecipe(id: string) {
    const [row] = await db.select().from(factoryRecipesTable).where(eq(factoryRecipesTable.id, id)).limit(1);
    return row ?? null;
  }

  async createRecipe(input: Omit<FactoryRecipe, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(factoryRecipesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateRecipe(id: string, input: Partial<FactoryRecipe>) {
    const [row] = await db.update(factoryRecipesTable).set({ ...input, updatedAt: new Date() }).where(eq(factoryRecipesTable.id, id)).returning();
    return row ?? null;
  }

  // ── Brands ─────────────────────────────────────────────────────────────────

  async listBrands(companyId?: string, opts: { search?: string; limit?: number; offset?: number } = {}) {
    const { search, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (companyId) conditions.push(eq(brandsTable.companyId, companyId));
    if (search) conditions.push(ilike(brandsTable.name, `%${search}%`));
    return db.select().from(brandsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(brandsTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getBrand(id: string) {
    const [row] = await db.select().from(brandsTable).where(eq(brandsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createBrand(input: Omit<Brand, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(brandsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateBrand(id: string, input: Partial<Brand>) {
    const [row] = await db.update(brandsTable).set({ ...input, updatedAt: new Date() }).where(eq(brandsTable.id, id)).returning();
    return row ?? null;
  }

  async countBrands() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(brandsTable);
    return row?.count ?? 0;
  }

  // ── Products ───────────────────────────────────────────────────────────────

  async listProducts(opts: { companyId?: string; brandId?: string; storeId?: string; search?: string; limit?: number; offset?: number } = {}) {
    const { companyId, brandId, storeId, search, limit = 50, offset = 0 } = opts;
    const conditions = [];
    if (companyId) conditions.push(eq(productsTable.companyId, companyId));
    if (brandId)   conditions.push(eq(productsTable.brandId, brandId));
    if (storeId)   conditions.push(eq(productsTable.storeId, storeId));
    if (search)    conditions.push(ilike(productsTable.name, `%${search}%`));
    return db.select().from(productsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(productsTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getProduct(id: string) {
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
    return row ?? null;
  }

  async createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(productsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateProduct(id: string, input: Partial<Product>) {
    const [row] = await db.update(productsTable).set({ ...input, updatedAt: new Date() }).where(eq(productsTable.id, id)).returning();
    return row ?? null;
  }

  async countProducts() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
    return row?.count ?? 0;
  }

  // ── Assets ─────────────────────────────────────────────────────────────────

  async listAssets(companyId: string) {
    return db.select().from(businessAssetsTable).where(eq(businessAssetsTable.companyId, companyId)).orderBy(desc(businessAssetsTable.createdAt));
  }

  async createAsset(input: Omit<BusinessAsset, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(businessAssetsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateAsset(id: string, input: Partial<BusinessAsset>) {
    const [row] = await db.update(businessAssetsTable).set({ ...input, updatedAt: new Date() }).where(eq(businessAssetsTable.id, id)).returning();
    return row ?? null;
  }

  // ── Transactions ───────────────────────────────────────────────────────────

  async listTransactions(companyId: string, opts: { type?: string; limit?: number; offset?: number } = {}) {
    const { type, limit = 100, offset = 0 } = opts;
    const conditions = [eq(businessTransactionsTable.companyId, companyId)];
    if (type) conditions.push(eq(businessTransactionsTable.type, type as never));
    return db.select().from(businessTransactionsTable).where(and(...conditions))
      .orderBy(desc(businessTransactionsTable.createdAt)).limit(limit).offset(offset);
  }

  async createTransaction(input: Omit<BusinessTransaction, "id" | "createdAt">) {
    const [row] = await db.insert(businessTransactionsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async countTransactions() {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(businessTransactionsTable);
    return row?.count ?? 0;
  }

  // ── Invoices ───────────────────────────────────────────────────────────────

  async listInvoices(companyId: string, opts: { status?: string; limit?: number } = {}) {
    const { status, limit = 50 } = opts;
    const conditions = [eq(businessInvoicesTable.companyId, companyId)];
    if (status) conditions.push(eq(businessInvoicesTable.status, status as never));
    return db.select().from(businessInvoicesTable).where(and(...conditions)).orderBy(desc(businessInvoicesTable.createdAt)).limit(limit);
  }

  async getInvoice(id: string) {
    const [row] = await db.select().from(businessInvoicesTable).where(eq(businessInvoicesTable.id, id)).limit(1);
    return row ?? null;
  }

  async createInvoice(input: Omit<BusinessInvoice, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(businessInvoicesTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  async updateInvoice(id: string, input: Partial<BusinessInvoice>) {
    const [row] = await db.update(businessInvoicesTable).set({ ...input, updatedAt: new Date() }).where(eq(businessInvoicesTable.id, id)).returning();
    return row ?? null;
  }

  // ── Logs ───────────────────────────────────────────────────────────────────

  async listLogs(companyId: string, limit = 100) {
    return db.select().from(businessLogsTable).where(eq(businessLogsTable.companyId, companyId))
      .orderBy(desc(businessLogsTable.createdAt)).limit(limit);
  }

  async createLog(input: Omit<BusinessLog, "id" | "createdAt">) {
    const [row] = await db.insert(businessLogsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  async getStatistics(companyId: string) {
    const [row] = await db.select().from(businessStatisticsTable).where(eq(businessStatisticsTable.companyId, companyId)).limit(1);
    return row ?? null;
  }

  async upsertStatistics(companyId: string, input: Partial<BusinessStatistic>) {
    const existing = await this.getStatistics(companyId);
    if (existing) {
      const [row] = await db.update(businessStatisticsTable).set({ ...input, updatedAt: new Date() }).where(eq(businessStatisticsTable.companyId, companyId)).returning();
      return row!;
    }
    const [row] = await db.insert(businessStatisticsTable).values({ id: createId(), companyId, ...input }).returning();
    return row!;
  }

  async getGlobalStats() {
    const [companies] = await db.select({ count: sql<number>`count(*)::int` }).from(companiesTable);
    const [employees] = await db.select({ count: sql<number>`count(*)::int` }).from(employeesTable);
    const [stores]    = await db.select({ count: sql<number>`count(*)::int` }).from(storesTable);
    const [factories] = await db.select({ count: sql<number>`count(*)::int` }).from(factoriesTable);
    const [warehouses]= await db.select({ count: sql<number>`count(*)::int` }).from(warehousesTable);
    const [revenue]   = await db.select({ total: sql<number>`coalesce(sum(amount), 0)::float` }).from(businessTransactionsTable).where(eq(businessTransactionsTable.type, "REVENUE"));
    return {
      totalCompanies:  companies?.count  ?? 0,
      totalEmployees:  employees?.count  ?? 0,
      totalRevenue:    revenue?.total    ?? 0,
      totalStores:     stores?.count     ?? 0,
      totalFactories:  factories?.count  ?? 0,
      totalWarehouses: warehouses?.count ?? 0,
    };
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  async listReviews(companyId: string) {
    return db.select().from(businessReviewsTable).where(eq(businessReviewsTable.companyId, companyId)).orderBy(desc(businessReviewsTable.createdAt));
  }

  async createReview(input: Omit<BusinessReview, "id" | "createdAt" | "updatedAt">) {
    const [row] = await db.insert(businessReviewsTable).values({ id: createId(), ...input }).returning();
    return row!;
  }

  // ── Followers ──────────────────────────────────────────────────────────────

  async listFollowers(companyId: string) {
    return db.select().from(companyFollowersTable).where(eq(companyFollowersTable.companyId, companyId));
  }

  async isFollowing(companyId: string, userId: string) {
    const [row] = await db.select().from(companyFollowersTable)
      .where(and(eq(companyFollowersTable.companyId, companyId), eq(companyFollowersTable.userId, userId))).limit(1);
    return !!row;
  }

  async follow(companyId: string, userId: string) {
    const [row] = await db.insert(companyFollowersTable).values({ id: createId(), companyId, userId }).returning();
    return row!;
  }

  async unfollow(companyId: string, userId: string) {
    const [row] = await db.delete(companyFollowersTable)
      .where(and(eq(companyFollowersTable.companyId, companyId), eq(companyFollowersTable.userId, userId))).returning();
    return !!row;
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  async getSettings(companyId: string) {
    const [row] = await db.select().from(companySettingsTable).where(eq(companySettingsTable.companyId, companyId)).limit(1);
    return row ?? null;
  }

  async upsertSettings(companyId: string, input: Partial<CompanySetting>) {
    const existing = await this.getSettings(companyId);
    if (existing) {
      const [row] = await db.update(companySettingsTable).set({ ...input, updatedAt: new Date() }).where(eq(companySettingsTable.companyId, companyId)).returning();
      return row!;
    }
    const [row] = await db.insert(companySettingsTable).values({ id: createId(), companyId, ...input }).returning();
    return row!;
  }

  // ── Seed Data ──────────────────────────────────────────────────────────────

  async seedData() {
    const existing = await this.countCompanies();
    if (existing > 0) return;

    const systemUserId = "system";

    // 5 Business Categories
    const categoryData = [
      { name: "Công nghệ",    slug: "tech",           icon: "💻", type: "TECH" as const,    description: "Công ty công nghệ" },
      { name: "Bán lẻ",      slug: "retail",          icon: "🛒", type: "RETAIL" as const,  description: "Bán lẻ hàng hoá" },
      { name: "Sản xuất",    slug: "manufacturing",   icon: "🏭", type: "MANUFACTURING" as const, description: "Sản xuất công nghiệp" },
      { name: "Dịch vụ",     slug: "service",         icon: "🎯", type: "SERVICE" as const, description: "Dịch vụ chuyên nghiệp" },
      { name: "Tài chính",   slug: "finance",         icon: "💰", type: "FINANCE" as const, description: "Tài chính và ngân hàng" },
    ];

    const categories = await Promise.all(
      categoryData.map(c => db.insert(businessCategoriesTable).values({ id: createId(), ...c, isActive: true }).returning().then(r => r[0]!))
    );

    // 5 Companies
    const companyData = [
      { ownerId: systemUserId, categoryId: categories[0]?.id, name: "Universe Tech Corp",      slug: "universe-tech",      businessType: "TECH" as const,    type: "CORPORATION" as const,     status: "ACTIVE" as const, description: "Công ty công nghệ hàng đầu Universe",  logo: "💻", country: "Universe", level: 5, experience: 5000, totalRevenue: 500000, totalExpenses: 200000, totalProfit: 300000, employeeCount: 0, followerCount: 0, isPublic: true, isVerified: true },
      { ownerId: systemUserId, categoryId: categories[1]?.id, name: "Galaxy Retail Inc",       slug: "galaxy-retail",      businessType: "RETAIL" as const,  type: "LLC" as const,             status: "ACTIVE" as const, description: "Đế chế bán lẻ lớn nhất vũ trụ",     logo: "🛒", country: "Universe", level: 4, experience: 3500, totalRevenue: 350000, totalExpenses: 180000, totalProfit: 170000, employeeCount: 0, followerCount: 0, isPublic: true, isVerified: true },
      { ownerId: systemUserId, categoryId: categories[2]?.id, name: "Cosmos Manufacturing",   slug: "cosmos-mfg",         businessType: "MANUFACTURING" as const, type: "CORPORATION" as const, status: "ACTIVE" as const, description: "Nhà máy sản xuất đa ngành",         logo: "🏭", country: "Universe", level: 3, experience: 2000, totalRevenue: 200000, totalExpenses: 150000, totalProfit: 50000,  employeeCount: 0, followerCount: 0, isPublic: true, isVerified: false },
      { ownerId: systemUserId, categoryId: categories[3]?.id, name: "Nova Services Ltd",      slug: "nova-services",      businessType: "SERVICE" as const, type: "LLC" as const,             status: "ACTIVE" as const, description: "Dịch vụ tư vấn và giải pháp",       logo: "🎯", country: "Universe", level: 3, experience: 1800, totalRevenue: 180000, totalExpenses: 100000, totalProfit: 80000,  employeeCount: 0, followerCount: 0, isPublic: true, isVerified: false },
      { ownerId: systemUserId, categoryId: categories[4]?.id, name: "Stellar Finance Group",  slug: "stellar-finance",    businessType: "FINANCE" as const, type: "CORPORATION" as const,    status: "ACTIVE" as const, description: "Tập đoàn tài chính Universe",        logo: "💰", country: "Universe", level: 5, experience: 4500, totalRevenue: 900000, totalExpenses: 400000, totalProfit: 500000, employeeCount: 0, followerCount: 0, isPublic: true, isVerified: true },
    ];

    const companies = await Promise.all(
      companyData.map(c => db.insert(companiesTable).values({ id: createId(), ...c, foundedAt: new Date("2024-01-01"), metadata: null, city: null, address: null, website: null, email: null, phone: null, coverImage: null }).returning().then(r => r[0]!))
    );

    // 10 Departments (2 per company)
    const deptTypes: (typeof companyDepartmentsTable.$inferInsert["type"])[] = ["EXECUTIVE", "OPERATIONS", "FINANCE", "MARKETING", "TECH"];
    const deptNames = ["Ban lãnh đạo", "Vận hành", "Tài chính", "Marketing", "Công nghệ"];
    const depts: typeof companyDepartmentsTable.$inferSelect[] = [];
    for (let i = 0; i < companies.length && i < 5; i++) {
      const company = companies[i]!;
      const dept1 = await db.insert(companyDepartmentsTable).values({ id: createId(), companyId: company.id, name: deptNames[i]!, type: deptTypes[i]!, headCount: 5, budget: 50000, isActive: true, managerId: null, description: null }).returning().then(r => r[0]!);
      const dept2 = await db.insert(companyDepartmentsTable).values({ id: createId(), companyId: company.id, name: "Nhân sự", type: "HR", headCount: 3, budget: 30000, isActive: true, managerId: null, description: null }).returning().then(r => r[0]!);
      depts.push(dept1, dept2);
    }

    // 50 Employees (10 per company)
    const roles: (typeof employeesTable.$inferInsert["role"])[] = ["MANAGER", "EMPLOYEE", "EMPLOYEE", "SUPERVISOR", "EMPLOYEE", "EMPLOYEE", "CONTRACTOR", "EMPLOYEE", "EMPLOYEE", "INTERN"];
    const empNames = [
      ["An", "Nguyễn"], ["Bình", "Trần"], ["Chi", "Lê"], ["Dũng", "Phạm"], ["Em", "Hoàng"],
      ["Phúc", "Vũ"], ["Giang", "Đặng"], ["Hương", "Bùi"], ["Ích", "Đỗ"], ["Kim", "Ngô"],
    ];
    for (const company of companies) {
      const compDepts = depts.filter(d => d.companyId === company.id);
      for (let i = 0; i < 10; i++) {
        const name = empNames[i]!;
        const salary = 3000 + i * 500 + Math.floor(Math.random() * 1000);
        await db.insert(employeesTable).values({
          id: createId(), companyId: company.id,
          userId: systemUserId,
          departmentId: compDepts[i % compDepts.length]?.id ?? null,
          positionId: null,
          role: roles[i]!,
          employmentStatus: "ACTIVE",
          firstName: name[0]!, lastName: name[1]!,
          email: `${name[0]!.toLowerCase()}@${company.slug}.universe`,
          phone: null, avatar: null,
          salary, salaryPeriod: "MONTHLY",
          hiredAt: new Date("2024-01-15"),
          terminatedAt: null, metadata: null,
        });
      }
    }

    // Update employee counts
    for (const company of companies) {
      const count = await this.countEmployees(company.id);
      await db.update(companiesTable).set({ employeeCount: count }).where(eq(companiesTable.id, company.id));
    }

    // 5 Brands
    const brandData = [
      { companyId: companies[0]!.id, name: "TechNova",   slug: "technova",   logo: "🔵", type: "TECH" as const,         country: "Universe", rating: 4.8, productCount: 0, followerCount: 0, isActive: true, isVerified: true, metadata: null, description: "Brand công nghệ cao cấp", coverImage: null },
      { companyId: companies[1]!.id, name: "GalaxMart",  slug: "galaxmart",  logo: "🟡", type: "RETAIL" as const,       country: "Universe", rating: 4.5, productCount: 0, followerCount: 0, isActive: true, isVerified: true, metadata: null, description: "Brand bán lẻ toàn cầu", coverImage: null },
      { companyId: companies[2]!.id, name: "CosmoPro",   slug: "cosmopro",   logo: "🟠", type: "MANUFACTURING" as const,country: "Universe", rating: 4.2, productCount: 0, followerCount: 0, isActive: true, isVerified: false, metadata: null, description: "Brand sản phẩm công nghiệp", coverImage: null },
      { companyId: companies[3]!.id, name: "NovaServ",   slug: "novaserv",   logo: "🟢", type: "SERVICE" as const,      country: "Universe", rating: 4.6, productCount: 0, followerCount: 0, isActive: true, isVerified: false, metadata: null, description: "Brand dịch vụ premium", coverImage: null },
      { companyId: companies[4]!.id, name: "StellarPay", slug: "stellarpay", logo: "🔴", type: "FINANCE" as const,      country: "Universe", rating: 4.9, productCount: 0, followerCount: 0, isActive: true, isVerified: true, metadata: null, description: "Brand fintech hàng đầu", coverImage: null },
    ];

    const brands = await Promise.all(
      brandData.map(b => db.insert(brandsTable).values({ id: createId(), ...b }).returning().then(r => r[0]!))
    );

    // 5 Stores
    const storeData = [
      { companyId: companies[0]!.id, name: "TechNova Store",   slug: "technova-store",  type: "TECH" as const,    city: "Universe City", address: "123 Tech St", isOnline: true, isActive: true, rating: 4.8, totalSales: 100000, productCount: 0, metadata: null, logo: "💻", description: "Cửa hàng công nghệ", country: "Universe" },
      { companyId: companies[1]!.id, name: "GalaxMart Online", slug: "galaxmart-online", type: "RETAIL" as const,  city: "Orion City",    address: "456 Galaxy Ave", isOnline: true, isActive: true, rating: 4.5, totalSales: 80000, productCount: 0, metadata: null, logo: "🛒", description: "Siêu thị trực tuyến", country: "Universe" },
      { companyId: companies[2]!.id, name: "CosmoPro Factory Shop", slug: "cosmopro-shop", type: "WHOLESALE" as const, city: "Nebula Zone", address: "789 Factory Rd", isOnline: false, isActive: true, rating: 4.2, totalSales: 60000, productCount: 0, metadata: null, logo: "🏭", description: "Cửa hàng sản phẩm công nghiệp", country: "Universe" },
      { companyId: companies[3]!.id, name: "Nova Service Hub", slug: "nova-hub",          type: "SERVICE" as const, city: "Nova District", address: "321 Service Blvd", isOnline: true, isActive: true, rating: 4.6, totalSales: 45000, productCount: 0, metadata: null, logo: "🎯", description: "Trung tâm dịch vụ", country: "Universe" },
      { companyId: companies[4]!.id, name: "Stellar Finance Portal", slug: "stellar-portal", type: "FINANCE" as const, city: "Stellar Hub", address: "999 Finance Tower", isOnline: true, isActive: true, rating: 4.9, totalSales: 200000, productCount: 0, metadata: null, logo: "💰", description: "Cổng tài chính Universe", country: "Universe" },
    ];

    const stores = await Promise.all(
      storeData.map(s => db.insert(storesTable).values({ id: createId(), ...s }).returning().then(r => r[0]!))
    );

    // 5 Warehouses
    const warehouseData = [
      { companyId: companies[0]!.id, name: "Tech Storage Alpha",    type: "SECURE" as const,       capacity: 5000, usedCapacity: 2000, isActive: true, location: "Universe City Warehouse District", managerId: null, metadata: null, description: null },
      { companyId: companies[1]!.id, name: "Galaxy Distribution Hub", type: "DISTRIBUTION" as const, capacity: 10000, usedCapacity: 6000, isActive: true, location: "Orion Distribution Center", managerId: null, metadata: null, description: null },
      { companyId: companies[2]!.id, name: "Cosmos Factory Storage", type: "GENERAL" as const,      capacity: 8000, usedCapacity: 5000, isActive: true, location: "Nebula Industrial Zone", managerId: null, metadata: null, description: null },
      { companyId: companies[3]!.id, name: "Nova Digital Vault",     type: "VIRTUAL" as const,      capacity: 50000, usedCapacity: 10000, isActive: true, location: "Cloud Infrastructure", managerId: null, metadata: null, description: null },
      { companyId: companies[4]!.id, name: "Stellar Secure Vault",   type: "SECURE" as const,       capacity: 3000, usedCapacity: 1500, isActive: true, location: "Stellar Finance Tower B2", managerId: null, metadata: null, description: null },
    ];

    await Promise.all(warehouseData.map(w => db.insert(warehousesTable).values({ id: createId(), ...w })));

    // 3 Factories
    const factoryData = [
      { companyId: companies[2]!.id, name: "Cosmos Main Factory",    type: "MANUFACTURING" as const, capacity: 500, workerCount: 50, productionRate: 1.5, isActive: true, totalProduced: 15000, location: "Nebula Industrial Zone, Sector A", warehouseId: null, metadata: null, description: null },
      { companyId: companies[0]!.id, name: "TechNova Assembly Plant", type: "MANUFACTURING" as const, capacity: 200, workerCount: 25, productionRate: 2.0, isActive: true, totalProduced: 8000,  location: "Universe City Tech Park",       warehouseId: null, metadata: null, description: null },
      { companyId: companies[1]!.id, name: "Galaxy Packaging Plant", type: "MANUFACTURING" as const, capacity: 1000, workerCount: 80, productionRate: 3.0, isActive: true, totalProduced: 50000, location: "Orion Logistics Hub",            warehouseId: null, metadata: null, description: null },
    ];

    const factories = await Promise.all(factoryData.map(f => db.insert(factoriesTable).values({ id: createId(), ...f }).returning().then(r => r[0]!)));

    // Factory Recipes
    if (factories[0]) {
      await db.insert(factoryRecipesTable).values({
        id: createId(), factoryId: factories[0].id, companyId: factories[0].companyId,
        name: "Sản xuất linh kiện điện tử",
        inputs: [{ item: "Silicon", qty: 10 }, { item: "Copper", qty: 5 }],
        outputs: [{ item: "Circuit Board", qty: 3 }],
        duration: 120, cost: 500, isActive: true, timesRun: 120, description: null,
      });
    }

    // 20 Products (4 per company)
    const productData = [];
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i]!;
      const brand = brands[i];
      const store = stores[i];
      for (let j = 0; j < 4; j++) {
        productData.push({
          id: createId(), companyId: company.id, brandId: brand?.id ?? null, storeId: store?.id ?? null, factoryId: null,
          name: `Sản phẩm ${company.name} #${j + 1}`, slug: `product-${company.slug}-${j + 1}`,
          description: `Sản phẩm chất lượng cao từ ${company.name}`,
          images: null, sku: `SKU-${company.slug.toUpperCase()}-${j + 1}`,
          price: 100 + j * 50, cost: 50 + j * 20, stock: 100 + j * 20, minStock: 10,
          category: "General", tags: null,
          isActive: true, isFeatured: j === 0,
          rating: 4 + j * 0.1, totalSold: 50 + j * 10, totalRevenue: (100 + j * 50) * (50 + j * 10),
          metadata: null,
        });
      }
    }
    await db.insert(productsTable).values(productData);

    // 100 Transactions (20 per company)
    const txTypes: (typeof businessTransactionsTable.$inferInsert["type"])[] = ["REVENUE", "EXPENSE", "PAYROLL", "REVENUE", "REVENUE"];
    for (const company of companies) {
      const txData = [];
      for (let i = 0; i < 20; i++) {
        const txType = txTypes[i % txTypes.length]!;
        const amount = txType === "REVENUE" ? 1000 + i * 200 : 500 + i * 100;
        txData.push({
          id: createId(), companyId: company.id, type: txType,
          amount, currency: "USD",
          description: `Giao dịch ${txType} #${i + 1}`,
          reference: `TXN-${company.slug.toUpperCase()}-${i + 1}`,
          fromParty: txType === "REVENUE" ? "Customer" : company.name,
          toParty: txType === "REVENUE" ? company.name : "Vendor",
          relatedId: null, relatedType: null,
          balanceAfter: company.totalRevenue + (txType === "REVENUE" ? amount : -amount),
          metadata: null,
        });
      }
      await db.insert(businessTransactionsTable).values(txData);
    }

    // 30 Payrolls (6 per company)
    for (const company of companies) {
      for (let m = 0; m < 6; m++) {
        const periodStart = new Date(2025, m, 1);
        const periodEnd   = new Date(2025, m + 1, 0);
        const totalAmount = company.employeeCount * 4000 || 40000;
        const [payroll] = await db.insert(payrollsTable).values({
          id: createId(), companyId: company.id,
          name: `Bảng lương tháng ${m + 1}/2025`,
          period: "MONTHLY", periodStart, periodEnd,
          status: m < 5 ? "COMPLETED" : "PENDING",
          totalAmount, employeeCount: 10,
          processedAt: m < 5 ? new Date(2025, m + 1, 1) : null,
          notes: null,
        }).returning();
        if (payroll && m < 5) {
          // Create salary records for each employee in the payroll
          const emps = await this.listEmployees({ companyId: company.id, limit: 10 });
          const salaryData = emps.slice(0, 5).map(e => ({
            id: createId(), payrollId: payroll.id, employeeId: e.id, companyId: company.id,
            baseSalary: e.salary, bonus: e.salary * 0.1, deductions: e.salary * 0.05,
            netAmount: e.salary + e.salary * 0.1 - e.salary * 0.05,
            isPaid: true, paidAt: new Date(2025, m + 1, 2), notes: null,
          }));
          if (salaryData.length > 0) await db.insert(salariesTable).values(salaryData);
        }
      }
    }

    // Statistics
    for (const company of companies) {
      await db.insert(businessStatisticsTable).values({
        id: createId(), companyId: company.id,
        totalRevenue: company.totalRevenue,
        totalExpenses: company.totalExpenses,
        totalProfit: company.totalProfit,
        totalPayroll: company.totalExpenses * 0.5,
        totalTransactions: 20,
        totalEmployees: 10,
        totalDepartments: 2,
        totalStores: 1, totalWarehouses: 1, totalFactories: company.id === companies[2]?.id ? 1 : 0,
        totalProducts: 4, totalBrands: 1,
        monthlyRevenue: null,
      });
    }
  }
}
