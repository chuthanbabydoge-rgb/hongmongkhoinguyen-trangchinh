// ─────────────────────────────────────────────────────────────────────────────
// BusinessController — HUB-27
// ─────────────────────────────────────────────────────────────────────────────

import { type Request, type Response } from "express";
import { businessService } from "../container.js";
import { BusinessError }   from "../services/businessService.js";

function auth(req: Request): string | undefined {
  const h = req.headers["authorization"];
  return typeof h === "string" ? h : undefined;
}

function ok(res: Response, data: unknown, status = 200) {
  res.status(status).json({ ok: true, data });
}

function fail(res: Response, err: unknown) {
  if (err instanceof BusinessError) {
    res.status(err.status).json({ ok: false, error: err.message, code: err.code });
  } else {
    const msg = err instanceof Error ? err.message : "Lỗi không xác định";
    res.status(500).json({ ok: false, error: msg });
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function handleDashboard(req: Request, res: Response) {
  try { ok(res, await businessService.getDashboard()); } catch (e) { fail(res, e); }
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function handleListCategories(req: Request, res: Response) {
  try { ok(res, await businessService.listCategories()); } catch (e) { fail(res, e); }
}

// ── Companies ─────────────────────────────────────────────────────────────────

export async function handleListCompanies(req: Request, res: Response) {
  try {
    const { search, status, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listCompanies({ search, status, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleGetCompany(req: Request, res: Response) {
  try { ok(res, await businessService.getCompany(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleGetCompanyBySlug(req: Request, res: Response) {
  try { ok(res, await businessService.getCompanyBySlug(req.params["slug"] as string)); } catch (e) { fail(res, e); }
}

export async function handleMyCompanies(req: Request, res: Response) {
  try {
    const a = auth(req);
    const userId = a ? a.replace("Bearer ", "") : "system";
    ok(res, await businessService.getCompaniesByOwner(userId));
  } catch (e) { fail(res, e); }
}

export async function handleCreateCompany(req: Request, res: Response) {
  try { ok(res, await businessService.createCompany(req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateCompany(req: Request, res: Response) {
  try { ok(res, await businessService.updateCompany(req.params["id"] as string, req.body as Record<string, unknown>, auth(req))); } catch (e) { fail(res, e); }
}

export async function handleDeleteCompany(req: Request, res: Response) {
  try { ok(res, await businessService.deleteCompany(req.params["id"] as string, auth(req))); } catch (e) { fail(res, e); }
}

export async function handleGetCompanyProfile(req: Request, res: Response) {
  try { ok(res, await businessService.getCompanyProfile(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleUpsertCompanyProfile(req: Request, res: Response) {
  try { ok(res, await businessService.upsertCompanyProfile(req.params["id"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function handleListMembers(req: Request, res: Response) {
  try { ok(res, await businessService.listMembers(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleAddMember(req: Request, res: Response) {
  try { ok(res, await businessService.addMember(req.params["id"] as string, req.body as Record<string, unknown>), 201); } catch (e) { fail(res, e); }
}

export async function handleRemoveMember(req: Request, res: Response) {
  try { ok(res, { ok: await businessService.removeMember(req.params["memberId"] as string) }); } catch (e) { fail(res, e); }
}

// ── Departments ───────────────────────────────────────────────────────────────

export async function handleListDepartments(req: Request, res: Response) {
  try { ok(res, await businessService.listDepartments(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleGetDepartment(req: Request, res: Response) {
  try { ok(res, await businessService.getDepartment(req.params["deptId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateDepartment(req: Request, res: Response) {
  try { ok(res, await businessService.createDepartment(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateDepartment(req: Request, res: Response) {
  try { ok(res, await businessService.updateDepartment(req.params["deptId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

export async function handleDeleteDepartment(req: Request, res: Response) {
  try { ok(res, { ok: await businessService.deleteDepartment(req.params["deptId"] as string) }); } catch (e) { fail(res, e); }
}

// ── Positions ─────────────────────────────────────────────────────────────────

export async function handleListPositions(req: Request, res: Response) {
  try {
    const { departmentId } = req.query as Record<string, string>;
    ok(res, await businessService.listPositions(req.params["id"] as string, departmentId));
  } catch (e) { fail(res, e); }
}

export async function handleCreatePosition(req: Request, res: Response) {
  try { ok(res, await businessService.createPosition(req.params["id"] as string, req.body as Record<string, unknown>), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdatePosition(req: Request, res: Response) {
  try { ok(res, await businessService.updatePosition(req.params["posId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

// ── Employees ─────────────────────────────────────────────────────────────────

export async function handleListEmployees(req: Request, res: Response) {
  try {
    const { companyId, departmentId, status, search, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listEmployees({ companyId, departmentId, status, search, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleListCompanyEmployees(req: Request, res: Response) {
  try {
    const { departmentId, status, search, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listEmployees({ companyId: req.params["id"] as string, departmentId, status, search, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleGetEmployee(req: Request, res: Response) {
  try { ok(res, await businessService.getEmployee(req.params["empId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleHireEmployee(req: Request, res: Response) {
  try { ok(res, await businessService.hireEmployee(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateEmployee(req: Request, res: Response) {
  try { ok(res, await businessService.updateEmployee(req.params["empId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

export async function handleFireEmployee(req: Request, res: Response) {
  try { ok(res, await businessService.fireEmployee(req.params["empId"] as string, auth(req))); } catch (e) { fail(res, e); }
}

// ── Contracts ─────────────────────────────────────────────────────────────────

export async function handleListContracts(req: Request, res: Response) {
  try { ok(res, await businessService.listContracts(req.params["empId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateContract(req: Request, res: Response) {
  try {
    const { empId, id } = req.params as Record<string, string>;
    ok(res, await businessService.createContract(empId!, id!, req.body as Record<string, unknown>), 201);
  } catch (e) { fail(res, e); }
}

// ── Payrolls ──────────────────────────────────────────────────────────────────

export async function handleListPayrolls(req: Request, res: Response) {
  try {
    const { status, limit } = req.query as Record<string, string>;
    ok(res, await businessService.listPayrolls(req.params["id"] as string, { status, limit: limit ? +limit : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleCreatePayroll(req: Request, res: Response) {
  try { ok(res, await businessService.createPayroll(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleProcessPayroll(req: Request, res: Response) {
  try { ok(res, await businessService.processPayroll(req.params["payrollId"] as string, auth(req))); } catch (e) { fail(res, e); }
}

export async function handleListSalaries(req: Request, res: Response) {
  try { ok(res, await businessService.listSalaries(req.params["payrollId"] as string)); } catch (e) { fail(res, e); }
}

// ── Stores ────────────────────────────────────────────────────────────────────

export async function handleListStores(req: Request, res: Response) {
  try {
    const { companyId, search, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listStores(companyId, { search, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleListCompanyStores(req: Request, res: Response) {
  try { ok(res, await businessService.listStores(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleGetStore(req: Request, res: Response) {
  try { ok(res, await businessService.getStore(req.params["storeId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateStore(req: Request, res: Response) {
  try { ok(res, await businessService.createStore(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateStore(req: Request, res: Response) {
  try { ok(res, await businessService.updateStore(req.params["storeId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

// ── Warehouses ────────────────────────────────────────────────────────────────

export async function handleListWarehouses(req: Request, res: Response) {
  try {
    const { companyId } = req.query as Record<string, string>;
    ok(res, await businessService.listWarehouses(companyId));
  } catch (e) { fail(res, e); }
}

export async function handleListCompanyWarehouses(req: Request, res: Response) {
  try { ok(res, await businessService.listWarehouses(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleGetWarehouse(req: Request, res: Response) {
  try { ok(res, await businessService.getWarehouse(req.params["whId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateWarehouse(req: Request, res: Response) {
  try { ok(res, await businessService.createWarehouse(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateWarehouse(req: Request, res: Response) {
  try { ok(res, await businessService.updateWarehouse(req.params["whId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

export async function handleListWarehouseItems(req: Request, res: Response) {
  try { ok(res, await businessService.listWarehouseItems(req.params["whId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleUpsertWarehouseItem(req: Request, res: Response) {
  try { ok(res, await businessService.upsertWarehouseItem(req.params["whId"] as string, (req.body as Record<string, unknown>)["companyId"] as string, req.body as Record<string, unknown>), 201); } catch (e) { fail(res, e); }
}

// ── Factories ─────────────────────────────────────────────────────────────────

export async function handleListFactories(req: Request, res: Response) {
  try {
    const { companyId } = req.query as Record<string, string>;
    ok(res, await businessService.listFactories(companyId));
  } catch (e) { fail(res, e); }
}

export async function handleListCompanyFactories(req: Request, res: Response) {
  try { ok(res, await businessService.listFactories(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleGetFactory(req: Request, res: Response) {
  try { ok(res, await businessService.getFactory(req.params["factId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateFactory(req: Request, res: Response) {
  try { ok(res, await businessService.createFactory(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateFactory(req: Request, res: Response) {
  try { ok(res, await businessService.updateFactory(req.params["factId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

export async function handleListRecipes(req: Request, res: Response) {
  try { ok(res, await businessService.listRecipes(req.params["factId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateRecipe(req: Request, res: Response) {
  try { ok(res, await businessService.createRecipe(req.params["factId"] as string, (req.body as Record<string, unknown>)["companyId"] as string, req.body as Record<string, unknown>), 201); } catch (e) { fail(res, e); }
}

export async function handleRunRecipe(req: Request, res: Response) {
  try { ok(res, await businessService.runRecipe(req.params["recipeId"] as string, auth(req))); } catch (e) { fail(res, e); }
}

// ── Brands ────────────────────────────────────────────────────────────────────

export async function handleListBrands(req: Request, res: Response) {
  try {
    const { companyId, search, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listBrands(companyId, { search, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleListCompanyBrands(req: Request, res: Response) {
  try { ok(res, await businessService.listBrands(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleGetBrand(req: Request, res: Response) {
  try { ok(res, await businessService.getBrand(req.params["brandId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateBrand(req: Request, res: Response) {
  try { ok(res, await businessService.createBrand(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateBrand(req: Request, res: Response) {
  try { ok(res, await businessService.updateBrand(req.params["brandId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function handleListProducts(req: Request, res: Response) {
  try {
    const { companyId, brandId, storeId, search, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listProducts({ companyId, brandId, storeId, search, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleListCompanyProducts(req: Request, res: Response) {
  try { ok(res, await businessService.listProducts({ companyId: req.params["id"] as string })); } catch (e) { fail(res, e); }
}

export async function handleGetProduct(req: Request, res: Response) {
  try { ok(res, await businessService.getProduct(req.params["prodId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateProduct(req: Request, res: Response) {
  try { ok(res, await businessService.createProduct(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateProduct(req: Request, res: Response) {
  try { ok(res, await businessService.updateProduct(req.params["prodId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function handleListTransactions(req: Request, res: Response) {
  try {
    const { companyId, type, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listTransactions(companyId ?? "", { type, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleListCompanyTransactions(req: Request, res: Response) {
  try {
    const { type, limit, offset } = req.query as Record<string, string>;
    ok(res, await businessService.listTransactions(req.params["id"] as string, { type, limit: limit ? +limit : undefined, offset: offset ? +offset : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleCreateTransaction(req: Request, res: Response) {
  try { ok(res, await businessService.createTransaction(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export async function handleListInvoices(req: Request, res: Response) {
  try {
    const { status, limit } = req.query as Record<string, string>;
    ok(res, await businessService.listInvoices(req.params["id"] as string, { status, limit: limit ? +limit : undefined }));
  } catch (e) { fail(res, e); }
}

export async function handleGetInvoice(req: Request, res: Response) {
  try { ok(res, await businessService.getInvoice(req.params["invId"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateInvoice(req: Request, res: Response) {
  try { ok(res, await businessService.createInvoice(req.params["id"] as string, req.body as Record<string, unknown>), 201); } catch (e) { fail(res, e); }
}

export async function handleUpdateInvoice(req: Request, res: Response) {
  try { ok(res, await businessService.updateInvoice(req.params["invId"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

// ── Assets ────────────────────────────────────────────────────────────────────

export async function handleListAssets(req: Request, res: Response) {
  try { ok(res, await businessService.listAssets(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateAsset(req: Request, res: Response) {
  try { ok(res, await businessService.createAsset(req.params["id"] as string, req.body as Record<string, unknown>), 201); } catch (e) { fail(res, e); }
}

// ── Statistics ────────────────────────────────────────────────────────────────

export async function handleGetStatistics(req: Request, res: Response) {
  try { ok(res, await businessService.getStatistics(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleGetGlobalStats(req: Request, res: Response) {
  try { ok(res, await businessService.getGlobalStats()); } catch (e) { fail(res, e); }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function handleListReviews(req: Request, res: Response) {
  try { ok(res, await businessService.listReviews(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleCreateReview(req: Request, res: Response) {
  try { ok(res, await businessService.createReview(req.params["id"] as string, req.body as Record<string, unknown>, auth(req)), 201); } catch (e) { fail(res, e); }
}

// ── Followers ─────────────────────────────────────────────────────────────────

export async function handleListFollowers(req: Request, res: Response) {
  try { ok(res, await businessService.listFollowers(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleFollow(req: Request, res: Response) {
  try { ok(res, await businessService.follow(req.params["id"] as string, auth(req)), 201); } catch (e) { fail(res, e); }
}

export async function handleUnfollow(req: Request, res: Response) {
  try { ok(res, await businessService.unfollow(req.params["id"] as string, auth(req))); } catch (e) { fail(res, e); }
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function handleGetSettings(req: Request, res: Response) {
  try { ok(res, await businessService.getSettings(req.params["id"] as string)); } catch (e) { fail(res, e); }
}

export async function handleUpsertSettings(req: Request, res: Response) {
  try { ok(res, await businessService.upsertSettings(req.params["id"] as string, req.body as Record<string, unknown>)); } catch (e) { fail(res, e); }
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export async function handleListLogs(req: Request, res: Response) {
  try {
    const { limit } = req.query as Record<string, string>;
    ok(res, await businessService.listLogs(req.params["id"] as string, limit ? +limit : undefined));
  } catch (e) { fail(res, e); }
}
