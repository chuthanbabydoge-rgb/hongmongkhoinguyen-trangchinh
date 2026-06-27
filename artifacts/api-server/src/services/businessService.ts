// ─────────────────────────────────────────────────────────────────────────────
// BusinessService — HUB-27
// ─────────────────────────────────────────────────────────────────────────────

import type { IBusinessRepository } from "../repositories/drizzle/DrizzleBusinessRepository.js";
import type { NotificationsService } from "./notificationsService.js";
import type { ActivitiesService }    from "./activitiesService.js";
import type { IUserReputationRepository } from "../repositories/userReputationRepository.js";
import { businessEventBus } from "../realtime/businessEventBus.js";

// ─── Error ────────────────────────────────────────────────────────────────────

export class BusinessError extends Error {
  constructor(message: string, public code: string, public status = 400) {
    super(message);
    this.name = "BusinessError";
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveUserId(auth: string | undefined): string | undefined {
  if (!auth) return undefined;
  try {
    const payload = auth.replace("Bearer ", "").split(".")[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (decoded as Record<string, unknown>)["sub"] as string | undefined
      || (decoded as Record<string, unknown>)["userId"] as string | undefined
      || (decoded as Record<string, unknown>)["id"] as string | undefined;
  } catch { return undefined; }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class BusinessService {
  constructor(
    private readonly repo:          IBusinessRepository,
    private readonly notifService:  NotificationsService,
    private readonly actService:    ActivitiesService,
    private readonly reputationRepo: IUserReputationRepository,
  ) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard() {
    const globalStats = await this.repo.getGlobalStats();
    const companies   = await this.repo.listCompanies({ limit: 5 });
    const products    = await this.repo.listProducts({ limit: 5 });
    const brands      = await this.repo.listBrands(undefined, { limit: 5 });
    const stores      = await this.repo.listStores(undefined, { limit: 5 });
    const factories   = await this.repo.listFactories();
    const warehouses  = await this.repo.listWarehouses();
    return { globalStats, companies, products, brands, stores, factories: factories.slice(0, 3), warehouses: warehouses.slice(0, 3) };
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  async listCategories() { return this.repo.listCategories(); }

  // ── Companies ──────────────────────────────────────────────────────────────

  async listCompanies(opts: { search?: string; status?: string; limit?: number; offset?: number } = {}) {
    return this.repo.listCompanies(opts);
  }

  async getCompany(id: string) {
    const company = await this.repo.getCompany(id);
    if (!company) throw new BusinessError("Không tìm thấy công ty", "NOT_FOUND", 404);
    return company;
  }

  async getCompanyBySlug(slug: string) {
    const company = await this.repo.getCompanyBySlug(slug);
    if (!company) throw new BusinessError("Không tìm thấy công ty", "NOT_FOUND", 404);
    return company;
  }

  async getCompaniesByOwner(ownerId: string) { return this.repo.getCompaniesByOwner(ownerId); }

  async createCompany(input: Record<string, unknown>, auth?: string) {
    if (!input["name"] || !input["slug"]) throw new BusinessError("name, slug là bắt buộc", "VALIDATION");
    const userId = resolveUserId(auth) ?? "system";
    const company = await this.repo.createCompany({
      ownerId:       userId,
      categoryId:    (input["categoryId"] as string) ?? null,
      name:          input["name"] as string,
      slug:          input["slug"] as string,
      description:   (input["description"] as string) ?? null,
      logo:          (input["logo"] as string) ?? null,
      coverImage:    null,
      type:          (input["type"] as never) ?? "PLAYER_COMPANY",
      status:        "ACTIVE",
      businessType:  (input["businessType"] as never) ?? "OTHER",
      country:       (input["country"] as string) ?? "Universe",
      city:          (input["city"] as string) ?? null,
      address:       null, website: null, email: null, phone: null,
      foundedAt:     new Date(),
      employeeCount: 0, followerCount: 0, level: 1, experience: 0,
      totalRevenue: 0, totalExpenses: 0, totalProfit: 0,
      isPublic: true, isVerified: false, metadata: null,
    });
    businessEventBus.emit("COMPANY_CREATED", { companyId: company.id, name: company.name, ownerId: userId });
    await this.actService.createActivity({ userId, type: "business", title: `Thành lập công ty: ${company.name}`, description: "" });
    await this.reputationRepo.upsert(userId, 50);
    return company;
  }

  async updateCompany(id: string, input: Record<string, unknown>, auth?: string) {
    const company = await this.repo.updateCompany(id, input as never);
    if (!company) throw new BusinessError("Không tìm thấy công ty", "NOT_FOUND", 404);
    businessEventBus.emit("COMPANY_UPDATED", { companyId: id });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Cập nhật công ty: ${company.name}`, description: "" });
    return company;
  }

  async deleteCompany(id: string, auth?: string) {
    const ok = await this.repo.deleteCompany(id);
    if (!ok) throw new BusinessError("Không tìm thấy công ty", "NOT_FOUND", 404);
    businessEventBus.emit("COMPANY_DELETED", { companyId: id });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: "Giải thể công ty", description: "" });
    return { ok: true };
  }

  async getCompanyProfile(companyId: string) { return this.repo.getCompanyProfile(companyId); }
  async upsertCompanyProfile(companyId: string, input: Record<string, unknown>) {
    return this.repo.upsertCompanyProfile(companyId, input as never);
  }

  // ── Members ────────────────────────────────────────────────────────────────

  async listMembers(companyId: string)     { return this.repo.listMembers(companyId); }
  async addMember(companyId: string, input: Record<string, unknown>) {
    return this.repo.addMember({ companyId, userId: input["userId"] as string, role: (input["role"] as never) ?? "EMPLOYEE", title: input["title"] as string | undefined, isActive: true });
  }
  async removeMember(id: string)           { return this.repo.removeMember(id); }

  // ── Departments ────────────────────────────────────────────────────────────

  async listDepartments(companyId: string) { return this.repo.listDepartments(companyId); }
  async getDepartment(id: string) {
    const dept = await this.repo.getDepartment(id);
    if (!dept) throw new BusinessError("Không tìm thấy phòng ban", "NOT_FOUND", 404);
    return dept;
  }

  async createDepartment(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["name"]) throw new BusinessError("name là bắt buộc", "VALIDATION");
    const dept = await this.repo.createDepartment({
      companyId, name: input["name"] as string,
      type:     (input["type"] as never) ?? "OTHER",
      description: (input["description"] as string) ?? null,
      managerId: null, headCount: 0, budget: (input["budget"] as number) ?? 0, isActive: true,
    });
    businessEventBus.emit("DEPARTMENT_CREATED", { deptId: dept.id, companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Tạo phòng ban: ${dept.name}`, description: "" });
    return dept;
  }

  async updateDepartment(id: string, input: Record<string, unknown>) { return this.repo.updateDepartment(id, input as never); }
  async deleteDepartment(id: string)                                  { return this.repo.deleteDepartment(id); }

  // ── Positions ──────────────────────────────────────────────────────────────

  async listPositions(companyId: string, departmentId?: string) { return this.repo.listPositions(companyId, departmentId); }
  async getPosition(id: string) { return this.repo.getPosition(id); }
  async createPosition(companyId: string, input: Record<string, unknown>) {
    return this.repo.createPosition({ companyId, departmentId: input["departmentId"] as string | undefined, title: input["title"] as string, description: input["description"] as string | undefined, level: (input["level"] as number) ?? 1, minSalary: (input["minSalary"] as number) ?? 0, maxSalary: (input["maxSalary"] as number) ?? 0, requirements: null, isActive: true });
  }
  async updatePosition(id: string, input: Record<string, unknown>) { return this.repo.updatePosition(id, input as never); }

  // ── Employees ──────────────────────────────────────────────────────────────

  async listEmployees(opts: { companyId?: string; departmentId?: string; status?: string; search?: string; limit?: number; offset?: number } = {}) {
    return this.repo.listEmployees(opts);
  }

  async getEmployee(id: string) {
    const emp = await this.repo.getEmployee(id);
    if (!emp) throw new BusinessError("Không tìm thấy nhân viên", "NOT_FOUND", 404);
    return emp;
  }

  async hireEmployee(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["firstName"] || !input["lastName"]) throw new BusinessError("firstName, lastName là bắt buộc", "VALIDATION");
    const emp = await this.repo.hireEmployee({
      companyId,
      userId:         (input["userId"] as string) ?? "system",
      departmentId:   (input["departmentId"] as string) ?? null,
      positionId:     null,
      role:           (input["role"] as never) ?? "EMPLOYEE",
      employmentStatus: "ACTIVE",
      firstName:      input["firstName"] as string,
      lastName:       input["lastName"] as string,
      email:          (input["email"] as string) ?? null,
      phone:          null, avatar: null,
      salary:         (input["salary"] as number) ?? 0,
      salaryPeriod:   (input["salaryPeriod"] as never) ?? "MONTHLY",
      hiredAt:        new Date(),
      terminatedAt:   null, metadata: null,
    });
    businessEventBus.emit("EMPLOYEE_HIRED", { employeeId: emp.id, companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Tuyển dụng nhân viên: ${emp.firstName} ${emp.lastName}`, description: "" });
    await this.repo.updateCompany(companyId, { employeeCount: await this.repo.countEmployees(companyId) });
    return emp;
  }

  async updateEmployee(id: string, input: Record<string, unknown>) { return this.repo.updateEmployee(id, input as never); }

  async fireEmployee(id: string, auth?: string) {
    const emp = await this.repo.fireEmployee(id);
    if (!emp) throw new BusinessError("Không tìm thấy nhân viên", "NOT_FOUND", 404);
    businessEventBus.emit("EMPLOYEE_FIRED", { employeeId: id, companyId: emp.companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Sa thải nhân viên: ${emp.firstName} ${emp.lastName}`, description: "" });
    await this.repo.updateCompany(emp.companyId, { employeeCount: await this.repo.countEmployees(emp.companyId) });
    return emp;
  }

  // ── Contracts ──────────────────────────────────────────────────────────────

  async listContracts(employeeId: string) { return this.repo.listContracts(employeeId); }
  async getContract(id: string)           { return this.repo.getContract(id); }
  async createContract(employeeId: string, companyId: string, input: Record<string, unknown>) {
    return this.repo.createContract({ employeeId, companyId, type: (input["type"] as string) ?? "FULL_TIME", salary: input["salary"] as number, salaryPeriod: (input["salaryPeriod"] as never) ?? "MONTHLY", startDate: new Date(input["startDate"] as string), endDate: input["endDate"] ? new Date(input["endDate"] as string) : null, terms: input["terms"] as string | undefined, benefits: null, isActive: true, signedAt: new Date() });
  }
  async updateContract(id: string, input: Record<string, unknown>) { return this.repo.updateContract(id, input as never); }

  // ── Payrolls ───────────────────────────────────────────────────────────────

  async listPayrolls(companyId: string, opts: { status?: string; limit?: number } = {}) { return this.repo.listPayrolls(companyId, opts); }
  async getPayroll(id: string) {
    const payroll = await this.repo.getPayroll(id);
    if (!payroll) throw new BusinessError("Không tìm thấy bảng lương", "NOT_FOUND", 404);
    return payroll;
  }

  async createPayroll(companyId: string, input: Record<string, unknown>, auth?: string) {
    const employees = await this.repo.listEmployees({ companyId, status: "ACTIVE" });
    const totalAmount = employees.reduce((s, e) => s + e.salary, 0);
    const payroll = await this.repo.createPayroll({
      companyId, name: (input["name"] as string) ?? `Bảng lương ${new Date().toLocaleDateString()}`,
      period: (input["period"] as never) ?? "MONTHLY",
      periodStart: new Date(input["periodStart"] as string),
      periodEnd: new Date(input["periodEnd"] as string),
      status: "PENDING", totalAmount, employeeCount: employees.length, processedAt: null, notes: null,
    });
    businessEventBus.emit("PAYROLL_COMPLETED", { payrollId: payroll.id, companyId, totalAmount });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Tạo bảng lương: ${payroll.name}`, description: "" });
    return payroll;
  }

  async processPayroll(id: string, auth?: string) {
    const payroll = await this.repo.getPayroll(id);
    if (!payroll) throw new BusinessError("Không tìm thấy bảng lương", "NOT_FOUND", 404);
    const updated = await this.repo.updatePayroll(id, { status: "COMPLETED", processedAt: new Date() });
    businessEventBus.emit("SALARY_PAID", { payrollId: id, totalAmount: payroll.totalAmount });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Xử lý bảng lương: ${payroll.name}`, description: "" });
    await this.repo.createTransaction({ companyId: payroll.companyId, type: "PAYROLL", amount: payroll.totalAmount, currency: "USD", description: `Thanh toán lương: ${payroll.name}`, reference: payroll.id, fromParty: null, toParty: null, relatedId: payroll.id, relatedType: "payroll", balanceAfter: 0, metadata: null });
    return updated;
  }

  async listSalaries(payrollId: string)           { return this.repo.listSalaries(payrollId); }

  // ── Stores ─────────────────────────────────────────────────────────────────

  async listStores(companyId?: string, opts: { search?: string; limit?: number; offset?: number } = {}) { return this.repo.listStores(companyId, opts); }
  async getStore(id: string) {
    const store = await this.repo.getStore(id);
    if (!store) throw new BusinessError("Không tìm thấy cửa hàng", "NOT_FOUND", 404);
    return store;
  }

  async createStore(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["name"] || !input["slug"]) throw new BusinessError("name, slug là bắt buộc", "VALIDATION");
    const store = await this.repo.createStore({ companyId, name: input["name"] as string, slug: input["slug"] as string, description: input["description"] as string | undefined, logo: null, type: (input["type"] as never) ?? "RETAIL", country: (input["country"] as string) ?? "Universe", city: input["city"] as string | undefined, address: input["address"] as string | undefined, isOnline: (input["isOnline"] as boolean) ?? true, isActive: true, rating: 0, totalSales: 0, productCount: 0, metadata: null });
    businessEventBus.emit("STORE_CREATED", { storeId: store.id, companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Mở cửa hàng: ${store.name}`, description: "" });
    return store;
  }

  async updateStore(id: string, input: Record<string, unknown>) { return this.repo.updateStore(id, input as never); }

  // ── Warehouses ─────────────────────────────────────────────────────────────

  async listWarehouses(companyId?: string) { return this.repo.listWarehouses(companyId); }
  async getWarehouse(id: string) {
    const w = await this.repo.getWarehouse(id);
    if (!w) throw new BusinessError("Không tìm thấy kho hàng", "NOT_FOUND", 404);
    return w;
  }

  async createWarehouse(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["name"]) throw new BusinessError("name là bắt buộc", "VALIDATION");
    const w = await this.repo.createWarehouse({ companyId, name: input["name"] as string, type: (input["type"] as never) ?? "GENERAL", description: null, location: (input["location"] as string) ?? null, capacity: (input["capacity"] as number) ?? 1000, usedCapacity: 0, isActive: true, managerId: null, metadata: null });
    businessEventBus.emit("WAREHOUSE_UPDATED", { warehouseId: w.id, companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Tạo kho hàng: ${w.name}`, description: "" });
    return w;
  }

  async updateWarehouse(id: string, input: Record<string, unknown>) {
    const w = await this.repo.updateWarehouse(id, input as never);
    if (w) businessEventBus.emit("WAREHOUSE_UPDATED", { warehouseId: id });
    return w;
  }

  async listWarehouseItems(warehouseId: string)   { return this.repo.listWarehouseItems(warehouseId); }
  async upsertWarehouseItem(warehouseId: string, companyId: string, input: Record<string, unknown>) {
    return this.repo.upsertWarehouseItem({ warehouseId, companyId, productId: null, name: input["name"] as string, sku: input["sku"] as string | undefined, quantity: (input["quantity"] as number) ?? 0, minQuantity: 0, maxQuantity: 10000, unitCost: (input["unitCost"] as number) ?? 0, totalValue: 0, location: null, expiresAt: null, metadata: null });
  }
  async updateWarehouseItem(id: string, input: Record<string, unknown>) { return this.repo.updateWarehouseItem(id, input as never); }

  // ── Factories ──────────────────────────────────────────────────────────────

  async listFactories(companyId?: string) { return this.repo.listFactories(companyId); }
  async getFactory(id: string) {
    const f = await this.repo.getFactory(id);
    if (!f) throw new BusinessError("Không tìm thấy nhà máy", "NOT_FOUND", 404);
    return f;
  }

  async createFactory(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["name"]) throw new BusinessError("name là bắt buộc", "VALIDATION");
    const f = await this.repo.createFactory({ companyId, warehouseId: null, name: input["name"] as string, description: null, type: (input["type"] as never) ?? "MANUFACTURING", location: (input["location"] as string) ?? null, capacity: (input["capacity"] as number) ?? 100, workerCount: 0, productionRate: 1, isActive: true, totalProduced: 0, metadata: null });
    businessEventBus.emit("FACTORY_STARTED", { factoryId: f.id, companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Khởi động nhà máy: ${f.name}`, description: "" });
    return f;
  }

  async updateFactory(id: string, input: Record<string, unknown>) { return this.repo.updateFactory(id, input as never); }
  async listRecipes(factoryId: string)       { return this.repo.listRecipes(factoryId); }
  async createRecipe(factoryId: string, companyId: string, input: Record<string, unknown>) {
    return this.repo.createRecipe({ factoryId, companyId, name: input["name"] as string, description: null, inputs: (input["inputs"] as never) ?? [], outputs: (input["outputs"] as never) ?? [], duration: (input["duration"] as number) ?? 60, cost: (input["cost"] as number) ?? 0, isActive: true, timesRun: 0 });
  }
  async runRecipe(id: string, auth?: string) {
    const recipe = await this.repo.getRecipe(id);
    if (!recipe) throw new BusinessError("Không tìm thấy công thức", "NOT_FOUND", 404);
    await this.repo.updateRecipe(id, { timesRun: recipe.timesRun + 1 });
    const factory = await this.repo.getFactory(recipe.factoryId);
    if (factory) await this.repo.updateFactory(factory.id, { totalProduced: factory.totalProduced + 1 });
    businessEventBus.emit("FACTORY_COMPLETED", { recipeId: id, factoryId: recipe.factoryId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Sản xuất theo công thức: ${recipe.name}`, description: "" });
    return { ok: true, recipe };
  }

  // ── Brands ─────────────────────────────────────────────────────────────────

  async listBrands(companyId?: string, opts: { search?: string; limit?: number; offset?: number } = {}) { return this.repo.listBrands(companyId, opts); }
  async getBrand(id: string) {
    const b = await this.repo.getBrand(id);
    if (!b) throw new BusinessError("Không tìm thấy thương hiệu", "NOT_FOUND", 404);
    return b;
  }

  async createBrand(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["name"] || !input["slug"]) throw new BusinessError("name, slug là bắt buộc", "VALIDATION");
    const b = await this.repo.createBrand({ companyId, name: input["name"] as string, slug: input["slug"] as string, description: input["description"] as string | undefined, logo: null, coverImage: null, country: (input["country"] as string) ?? "Universe", type: (input["type"] as never) ?? "OTHER", isActive: true, isVerified: false, rating: 0, productCount: 0, followerCount: 0, metadata: null });
    businessEventBus.emit("BRAND_CREATED", { brandId: b.id, companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Tạo thương hiệu: ${b.name}`, description: "" });
    return b;
  }

  async updateBrand(id: string, input: Record<string, unknown>) { return this.repo.updateBrand(id, input as never); }

  // ── Products ───────────────────────────────────────────────────────────────

  async listProducts(opts: { companyId?: string; brandId?: string; storeId?: string; search?: string; limit?: number; offset?: number } = {}) { return this.repo.listProducts(opts); }
  async getProduct(id: string) {
    const p = await this.repo.getProduct(id);
    if (!p) throw new BusinessError("Không tìm thấy sản phẩm", "NOT_FOUND", 404);
    return p;
  }

  async createProduct(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["name"] || !input["slug"]) throw new BusinessError("name, slug là bắt buộc", "VALIDATION");
    const p = await this.repo.createProduct({ companyId, brandId: input["brandId"] as string | undefined, storeId: input["storeId"] as string | undefined, factoryId: null, name: input["name"] as string, slug: input["slug"] as string, description: input["description"] as string | undefined, images: null, sku: input["sku"] as string | undefined, price: (input["price"] as number) ?? 0, cost: 0, stock: (input["stock"] as number) ?? 0, minStock: 0, category: input["category"] as string | undefined, tags: null, isActive: true, isFeatured: false, rating: 0, totalSold: 0, totalRevenue: 0, metadata: null });
    businessEventBus.emit("PRODUCT_CREATED", { productId: p.id, companyId });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Tạo sản phẩm: ${p.name}`, description: "" });
    return p;
  }

  async updateProduct(id: string, input: Record<string, unknown>) { return this.repo.updateProduct(id, input as never); }

  // ── Transactions ───────────────────────────────────────────────────────────

  async listTransactions(companyId: string, opts: { type?: string; limit?: number; offset?: number } = {}) { return this.repo.listTransactions(companyId, opts); }
  async createTransaction(companyId: string, input: Record<string, unknown>, auth?: string) {
    if (!input["type"] || !input["amount"]) throw new BusinessError("type, amount là bắt buộc", "VALIDATION");
    const tx = await this.repo.createTransaction({ companyId, type: input["type"] as never, amount: input["amount"] as number, currency: (input["currency"] as string) ?? "USD", description: (input["description"] as string) ?? "", reference: null, fromParty: null, toParty: null, relatedId: null, relatedType: null, balanceAfter: 0, metadata: null });
    businessEventBus.emit("TRANSACTION_CREATED", { txId: tx.id, companyId, type: tx.type, amount: tx.amount });
    if (tx.type === "REVENUE") businessEventBus.emit("REVENUE_RECEIVED", { txId: tx.id, companyId, amount: tx.amount });
    const userId = resolveUserId(auth);
    if (userId) await this.actService.createActivity({ userId, type: "business", title: `Giao dịch ${tx.type}: ${tx.amount}`, description: "" });
    return tx;
  }

  // ── Invoices ───────────────────────────────────────────────────────────────

  async listInvoices(companyId: string, opts: { status?: string; limit?: number } = {}) { return this.repo.listInvoices(companyId, opts); }
  async getInvoice(id: string) { return this.repo.getInvoice(id); }
  async createInvoice(companyId: string, input: Record<string, unknown>) {
    const number = `INV-${Date.now()}`;
    return this.repo.createInvoice({ companyId, number, clientName: input["clientName"] as string, clientEmail: input["clientEmail"] as string | undefined, status: "DRAFT", items: (input["items"] as never) ?? [], subtotal: (input["subtotal"] as number) ?? 0, tax: (input["tax"] as number) ?? 0, total: (input["total"] as number) ?? 0, dueAt: input["dueAt"] ? new Date(input["dueAt"] as string) : null, paidAt: null, notes: input["notes"] as string | undefined });
  }
  async updateInvoice(id: string, input: Record<string, unknown>) { return this.repo.updateInvoice(id, input as never); }

  // ── Assets ─────────────────────────────────────────────────────────────────

  async listAssets(companyId: string) { return this.repo.listAssets(companyId); }
  async createAsset(companyId: string, input: Record<string, unknown>) {
    return this.repo.createAsset({ companyId, name: input["name"] as string, type: input["type"] as never, description: null, value: (input["value"] as number) ?? 0, purchasedAt: new Date(), depreciatedValue: 0, location: null, isActive: true, metadata: null });
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  async getStatistics(companyId: string) { return this.repo.getStatistics(companyId); }
  async getGlobalStats()                  { return this.repo.getGlobalStats(); }

  // ── Reviews ────────────────────────────────────────────────────────────────

  async listReviews(companyId: string) { return this.repo.listReviews(companyId); }
  async createReview(companyId: string, input: Record<string, unknown>, auth?: string) {
    const userId = resolveUserId(auth) ?? "system";
    if (!input["rating"] || !input["content"]) throw new BusinessError("rating, content là bắt buộc", "VALIDATION");
    return this.repo.createReview({ companyId, reviewerId: userId, rating: input["rating"] as number, title: input["title"] as string | undefined, content: input["content"] as string, isVerified: false, isHelpful: 0 });
  }

  // ── Followers ──────────────────────────────────────────────────────────────

  async listFollowers(companyId: string) { return this.repo.listFollowers(companyId); }
  async follow(companyId: string, auth?: string) {
    const userId = resolveUserId(auth) ?? "system";
    return this.repo.follow(companyId, userId);
  }
  async unfollow(companyId: string, auth?: string) {
    const userId = resolveUserId(auth) ?? "system";
    return this.repo.unfollow(companyId, userId);
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  async getSettings(companyId: string)                                   { return this.repo.getSettings(companyId); }
  async upsertSettings(companyId: string, input: Record<string, unknown>){ return this.repo.upsertSettings(companyId, input as never); }

  // ── Logs ───────────────────────────────────────────────────────────────────

  async listLogs(companyId: string, limit?: number) { return this.repo.listLogs(companyId, limit); }
}
