// ─────────────────────────────────────────────────────────────────────────────
// Business routes — HUB-27  (specific routes BEFORE param routes)
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  handleDashboard,
  handleListCategories,
  handleListCompanies, handleGetCompany, handleGetCompanyBySlug, handleMyCompanies,
  handleCreateCompany, handleUpdateCompany, handleDeleteCompany,
  handleGetCompanyProfile, handleUpsertCompanyProfile,
  handleListMembers, handleAddMember, handleRemoveMember,
  handleListDepartments, handleGetDepartment, handleCreateDepartment,
  handleUpdateDepartment, handleDeleteDepartment,
  handleListPositions, handleCreatePosition, handleUpdatePosition,
  handleListCompanyEmployees, handleGetEmployee, handleHireEmployee,
  handleUpdateEmployee, handleFireEmployee,
  handleListContracts, handleCreateContract,
  handleListPayrolls, handleCreatePayroll, handleProcessPayroll, handleListSalaries,
  handleListCompanyStores, handleGetStore, handleCreateStore, handleUpdateStore,
  handleListCompanyWarehouses, handleGetWarehouse, handleCreateWarehouse,
  handleUpdateWarehouse, handleListWarehouseItems, handleUpsertWarehouseItem,
  handleListCompanyFactories, handleGetFactory, handleCreateFactory,
  handleUpdateFactory, handleListRecipes, handleCreateRecipe, handleRunRecipe,
  handleListCompanyBrands, handleGetBrand, handleCreateBrand, handleUpdateBrand,
  handleListCompanyProducts, handleGetProduct, handleCreateProduct, handleUpdateProduct,
  handleListCompanyTransactions, handleCreateTransaction,
  handleListInvoices, handleGetInvoice, handleCreateInvoice, handleUpdateInvoice,
  handleListAssets, handleCreateAsset,
  handleGetStatistics, handleGetGlobalStats,
  handleListReviews, handleCreateReview,
  handleListFollowers, handleFollow, handleUnfollow,
  handleGetSettings, handleUpsertSettings,
  handleListLogs,
  handleListStores, handleListWarehouses, handleListFactories,
  handleListBrands, handleListProducts, handleListTransactions,
  handleListEmployees,
} from "../controllers/businessController.js";

const router: IRouter = Router();

// ── Dashboard & Global ────────────────────────────────────────────────────────
router.get("/business/dashboard",                            handleDashboard);
router.get("/business/categories",                           handleListCategories);
router.get("/business/stats",                                handleGetGlobalStats);

// ── Global lists (before /companies/:id) ─────────────────────────────────────
router.get("/business/companies",                            handleListCompanies);
router.post("/business/companies",                           requireAuth, handleCreateCompany);
router.get("/business/companies/my",                         requireAuth, handleMyCompanies);
router.get("/business/companies/slug/:slug",                 handleGetCompanyBySlug);

router.get("/business/employees",                            handleListEmployees);
router.get("/business/stores",                               handleListStores);
router.get("/business/warehouses",                           handleListWarehouses);
router.get("/business/factories",                            handleListFactories);
router.get("/business/brands",                               handleListBrands);
router.get("/business/products",                             handleListProducts);
router.get("/business/transactions",                         requireAuth, handleListTransactions);

// ── Company detail ────────────────────────────────────────────────────────────
router.get("/business/companies/:id",                        handleGetCompany);
router.put("/business/companies/:id",                        requireAuth, handleUpdateCompany);
router.delete("/business/companies/:id",                     requireAuth, handleDeleteCompany);

// ── Company Profile ───────────────────────────────────────────────────────────
router.get("/business/companies/:id/profile",                handleGetCompanyProfile);
router.put("/business/companies/:id/profile",                requireAuth, handleUpsertCompanyProfile);

// ── Members ───────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/members",                handleListMembers);
router.post("/business/companies/:id/members",               requireAuth, handleAddMember);
router.delete("/business/companies/:id/members/:memberId",   requireAuth, handleRemoveMember);

// ── Departments ───────────────────────────────────────────────────────────────
router.get("/business/companies/:id/departments",            handleListDepartments);
router.post("/business/companies/:id/departments",           requireAuth, handleCreateDepartment);
router.get("/business/companies/:id/departments/:deptId",   handleGetDepartment);
router.put("/business/companies/:id/departments/:deptId",   requireAuth, handleUpdateDepartment);
router.delete("/business/companies/:id/departments/:deptId",requireAuth, handleDeleteDepartment);

// ── Positions ─────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/positions",              handleListPositions);
router.post("/business/companies/:id/positions",             requireAuth, handleCreatePosition);
router.put("/business/companies/:id/positions/:posId",       requireAuth, handleUpdatePosition);

// ── Employees ─────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/employees",              handleListCompanyEmployees);
router.post("/business/companies/:id/employees",             requireAuth, handleHireEmployee);
router.get("/business/companies/:id/employees/:empId",       handleGetEmployee);
router.put("/business/companies/:id/employees/:empId",       requireAuth, handleUpdateEmployee);
router.delete("/business/companies/:id/employees/:empId",    requireAuth, handleFireEmployee);

// ── Contracts ─────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/employees/:empId/contracts",   handleListContracts);
router.post("/business/companies/:id/employees/:empId/contracts",  requireAuth, handleCreateContract);

// ── Payrolls ──────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/payroll",                handleListPayrolls);
router.post("/business/companies/:id/payroll",               requireAuth, handleCreatePayroll);
router.post("/business/companies/:id/payroll/:payrollId/process", requireAuth, handleProcessPayroll);
router.get("/business/companies/:id/payroll/:payrollId/salaries",  handleListSalaries);

// ── Stores ────────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/stores",                 handleListCompanyStores);
router.post("/business/companies/:id/stores",                requireAuth, handleCreateStore);
router.get("/business/companies/:id/stores/:storeId",        handleGetStore);
router.put("/business/companies/:id/stores/:storeId",        requireAuth, handleUpdateStore);

// ── Warehouses ────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/warehouses",             handleListCompanyWarehouses);
router.post("/business/companies/:id/warehouses",            requireAuth, handleCreateWarehouse);
router.get("/business/companies/:id/warehouses/:whId",       handleGetWarehouse);
router.put("/business/companies/:id/warehouses/:whId",       requireAuth, handleUpdateWarehouse);
router.get("/business/companies/:id/warehouses/:whId/items", handleListWarehouseItems);
router.post("/business/companies/:id/warehouses/:whId/items",requireAuth, handleUpsertWarehouseItem);

// ── Factories ─────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/factories",              handleListCompanyFactories);
router.post("/business/companies/:id/factories",             requireAuth, handleCreateFactory);
router.get("/business/companies/:id/factories/:factId",      handleGetFactory);
router.put("/business/companies/:id/factories/:factId",      requireAuth, handleUpdateFactory);
router.get("/business/companies/:id/factories/:factId/recipes",    handleListRecipes);
router.post("/business/companies/:id/factories/:factId/recipes",   requireAuth, handleCreateRecipe);
router.post("/business/companies/:id/factories/:factId/recipes/:recipeId/run", requireAuth, handleRunRecipe);

// ── Brands ────────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/brands",                 handleListCompanyBrands);
router.post("/business/companies/:id/brands",                requireAuth, handleCreateBrand);
router.get("/business/companies/:id/brands/:brandId",        handleGetBrand);
router.put("/business/companies/:id/brands/:brandId",        requireAuth, handleUpdateBrand);

// ── Products ──────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/products",               handleListCompanyProducts);
router.post("/business/companies/:id/products",              requireAuth, handleCreateProduct);
router.get("/business/companies/:id/products/:prodId",       handleGetProduct);
router.put("/business/companies/:id/products/:prodId",       requireAuth, handleUpdateProduct);

// ── Transactions ──────────────────────────────────────────────────────────────
router.get("/business/companies/:id/transactions",           handleListCompanyTransactions);
router.post("/business/companies/:id/transactions",          requireAuth, handleCreateTransaction);

// ── Invoices ──────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/invoices",               handleListInvoices);
router.post("/business/companies/:id/invoices",              requireAuth, handleCreateInvoice);
router.get("/business/companies/:id/invoices/:invId",        handleGetInvoice);
router.put("/business/companies/:id/invoices/:invId",        requireAuth, handleUpdateInvoice);

// ── Assets ────────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/assets",                 handleListAssets);
router.post("/business/companies/:id/assets",                requireAuth, handleCreateAsset);

// ── Statistics ────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/statistics",             handleGetStatistics);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/reviews",                handleListReviews);
router.post("/business/companies/:id/reviews",               requireAuth, handleCreateReview);

// ── Followers ─────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/followers",              handleListFollowers);
router.post("/business/companies/:id/follow",                requireAuth, handleFollow);
router.delete("/business/companies/:id/follow",              requireAuth, handleUnfollow);

// ── Settings ──────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/settings",               handleGetSettings);
router.put("/business/companies/:id/settings",               requireAuth, handleUpsertSettings);

// ── Logs ──────────────────────────────────────────────────────────────────────
router.get("/business/companies/:id/logs",                   requireAuth, handleListLogs);

export default router;
