import {
  pgTable, text, integer, boolean, timestamp, pgEnum, jsonb, real, index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const businessTypeEnum = pgEnum("business_type", [
  "RETAIL", "WHOLESALE", "MANUFACTURING", "SERVICE", "FRANCHISE", "VIRTUAL",
  "TECH", "FINANCE", "REAL_ESTATE", "MEDIA", "FOOD", "OTHER",
]);

export const companyTypeEnum = pgEnum("company_type", [
  "SOLE_PROPRIETORSHIP", "PARTNERSHIP", "LLC", "CORPORATION", "COOPERATIVE",
  "NPC_COMPANY", "AI_COMPANY", "PLAYER_COMPANY",
]);

export const companyStatusEnum = pgEnum("company_status", [
  "ACTIVE", "INACTIVE", "SUSPENDED", "DISSOLVED", "PENDING",
]);

export const employeeRoleEnum = pgEnum("employee_role", [
  "OWNER", "CEO", "CTO", "CFO", "MANAGER", "SUPERVISOR",
  "EMPLOYEE", "INTERN", "CONTRACTOR", "ADVISOR",
]);

export const employmentStatusEnum = pgEnum("employment_status", [
  "ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED", "RESIGNED",
]);

export const departmentTypeEnum = pgEnum("department_type", [
  "EXECUTIVE", "OPERATIONS", "FINANCE", "MARKETING", "SALES",
  "HR", "TECH", "LOGISTICS", "PRODUCTION", "LEGAL", "OTHER",
]);

export const salaryPeriodEnum = pgEnum("salary_period", [
  "HOURLY", "DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY",
]);

export const payrollStatusEnum = pgEnum("payroll_status", [
  "PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "REFUNDED",
]);

export const warehouseTypeEnum = pgEnum("warehouse_type", [
  "GENERAL", "COLD_STORAGE", "SECURE", "VIRTUAL", "DISTRIBUTION",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "REAL_ESTATE", "EQUIPMENT", "VEHICLE", "IP", "INVENTORY",
  "CASH", "INVESTMENT", "VIRTUAL", "OTHER",
]);

export const businessTransactionTypeEnum = pgEnum("business_transaction_type", [
  "REVENUE", "EXPENSE", "PAYROLL", "INVESTMENT", "LOAN",
  "TRANSFER", "REFUND", "TAX", "DIVIDEND", "OTHER",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const businessCategoriesTable = pgTable("business_categories", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  name:        text("name").notNull().unique(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  icon:        text("icon").notNull().default("🏢"),
  type:        businessTypeEnum("type").notNull(),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

export type BusinessCategory = typeof businessCategoriesTable.$inferSelect;
export type NewBusinessCategory = typeof businessCategoriesTable.$inferInsert;

export const companiesTable = pgTable("companies", {
  id:              text("id").primaryKey().$defaultFn(() => createId()),
  ownerId:         text("owner_id").notNull(),
  categoryId:      text("category_id"),
  name:            text("name").notNull(),
  slug:            text("slug").notNull().unique(),
  description:     text("description"),
  logo:            text("logo"),
  coverImage:      text("cover_image"),
  type:            companyTypeEnum("type").notNull().default("PLAYER_COMPANY"),
  status:          companyStatusEnum("status").notNull().default("ACTIVE"),
  businessType:    businessTypeEnum("business_type").notNull().default("OTHER"),
  country:         text("country").notNull().default("Universe"),
  city:            text("city"),
  address:         text("address"),
  website:         text("website"),
  email:           text("email"),
  phone:           text("phone"),
  foundedAt:       timestamp("founded_at"),
  employeeCount:   integer("employee_count").notNull().default(0),
  followerCount:   integer("follower_count").notNull().default(0),
  level:           integer("level").notNull().default(1),
  experience:      integer("experience").notNull().default(0),
  totalRevenue:    real("total_revenue").notNull().default(0),
  totalExpenses:   real("total_expenses").notNull().default(0),
  totalProfit:     real("total_profit").notNull().default(0),
  isPublic:        boolean("is_public").notNull().default(true),
  isVerified:      boolean("is_verified").notNull().default(false),
  metadata:        jsonb("metadata"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("companies_owner_idx").on(t.ownerId),
  index("companies_status_idx").on(t.status),
]);

export type Company = typeof companiesTable.$inferSelect;
export type NewCompany = typeof companiesTable.$inferInsert;

export const companyProfilesTable = pgTable("company_profiles", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull().unique(),
  mission:     text("mission"),
  vision:      text("vision"),
  values:      text("values"),
  history:     text("history"),
  culture:     text("culture"),
  benefits:    jsonb("benefits"),
  socialLinks: jsonb("social_links"),
  awards:      jsonb("awards"),
  certifications: jsonb("certifications"),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export type CompanyProfile = typeof companyProfilesTable.$inferSelect;
export type NewCompanyProfile = typeof companyProfilesTable.$inferInsert;

export const companyMembersTable = pgTable("company_members", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  userId:      text("user_id").notNull(),
  role:        employeeRoleEnum("role").notNull().default("EMPLOYEE"),
  title:       text("title"),
  joinedAt:    timestamp("joined_at").notNull().defaultNow(),
  isActive:    boolean("is_active").notNull().default(true),
}, (t) => [
  index("company_members_company_idx").on(t.companyId),
  index("company_members_user_idx").on(t.userId),
]);

export type CompanyMember = typeof companyMembersTable.$inferSelect;
export type NewCompanyMember = typeof companyMembersTable.$inferInsert;

export const companyDepartmentsTable = pgTable("company_departments", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  name:        text("name").notNull(),
  type:        departmentTypeEnum("type").notNull().default("OTHER"),
  description: text("description"),
  managerId:   text("manager_id"),
  headCount:   integer("head_count").notNull().default(0),
  budget:      real("budget").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("company_departments_company_idx").on(t.companyId),
]);

export type CompanyDepartment = typeof companyDepartmentsTable.$inferSelect;
export type NewCompanyDepartment = typeof companyDepartmentsTable.$inferInsert;

export const companyPositionsTable = pgTable("company_positions", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  companyId:    text("company_id").notNull(),
  departmentId: text("department_id"),
  title:        text("title").notNull(),
  description:  text("description"),
  level:        integer("level").notNull().default(1),
  minSalary:    real("min_salary").notNull().default(0),
  maxSalary:    real("max_salary").notNull().default(0),
  requirements: jsonb("requirements"),
  isActive:     boolean("is_active").notNull().default(true),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("company_positions_company_idx").on(t.companyId),
]);

export type CompanyPosition = typeof companyPositionsTable.$inferSelect;
export type NewCompanyPosition = typeof companyPositionsTable.$inferInsert;

export const employeesTable = pgTable("employees", {
  id:             text("id").primaryKey().$defaultFn(() => createId()),
  companyId:      text("company_id").notNull(),
  userId:         text("user_id").notNull(),
  departmentId:   text("department_id"),
  positionId:     text("position_id"),
  role:           employeeRoleEnum("role").notNull().default("EMPLOYEE"),
  employmentStatus: employmentStatusEnum("employment_status").notNull().default("ACTIVE"),
  firstName:      text("first_name").notNull(),
  lastName:       text("last_name").notNull(),
  email:          text("email"),
  phone:          text("phone"),
  avatar:         text("avatar"),
  salary:         real("salary").notNull().default(0),
  salaryPeriod:   salaryPeriodEnum("salary_period").notNull().default("MONTHLY"),
  hiredAt:        timestamp("hired_at").notNull().defaultNow(),
  terminatedAt:   timestamp("terminated_at"),
  metadata:       jsonb("metadata"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("employees_company_idx").on(t.companyId),
  index("employees_user_idx").on(t.userId),
  index("employees_department_idx").on(t.departmentId),
]);

export type Employee = typeof employeesTable.$inferSelect;
export type NewEmployee = typeof employeesTable.$inferInsert;

export const employeeContractsTable = pgTable("employee_contracts", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  employeeId:    text("employee_id").notNull(),
  companyId:     text("company_id").notNull(),
  type:          text("type").notNull().default("FULL_TIME"),
  salary:        real("salary").notNull(),
  salaryPeriod:  salaryPeriodEnum("salary_period").notNull().default("MONTHLY"),
  startDate:     timestamp("start_date").notNull(),
  endDate:       timestamp("end_date"),
  terms:         text("terms"),
  benefits:      jsonb("benefits"),
  isActive:      boolean("is_active").notNull().default(true),
  signedAt:      timestamp("signed_at"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("employee_contracts_employee_idx").on(t.employeeId),
  index("employee_contracts_company_idx").on(t.companyId),
]);

export type EmployeeContract = typeof employeeContractsTable.$inferSelect;
export type NewEmployeeContract = typeof employeeContractsTable.$inferInsert;

export const payrollsTable = pgTable("payrolls", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  companyId:    text("company_id").notNull(),
  name:         text("name").notNull(),
  period:       salaryPeriodEnum("period").notNull().default("MONTHLY"),
  periodStart:  timestamp("period_start").notNull(),
  periodEnd:    timestamp("period_end").notNull(),
  status:       payrollStatusEnum("status").notNull().default("PENDING"),
  totalAmount:  real("total_amount").notNull().default(0),
  employeeCount: integer("employee_count").notNull().default(0),
  processedAt:  timestamp("processed_at"),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("payrolls_company_idx").on(t.companyId),
  index("payrolls_status_idx").on(t.status),
]);

export type Payroll = typeof payrollsTable.$inferSelect;
export type NewPayroll = typeof payrollsTable.$inferInsert;

export const salariesTable = pgTable("salaries", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  payrollId:   text("payroll_id").notNull(),
  employeeId:  text("employee_id").notNull(),
  companyId:   text("company_id").notNull(),
  baseSalary:  real("base_salary").notNull(),
  bonus:       real("bonus").notNull().default(0),
  deductions:  real("deductions").notNull().default(0),
  netAmount:   real("net_amount").notNull(),
  isPaid:      boolean("is_paid").notNull().default(false),
  paidAt:      timestamp("paid_at"),
  notes:       text("notes"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("salaries_payroll_idx").on(t.payrollId),
  index("salaries_employee_idx").on(t.employeeId),
]);

export type Salary = typeof salariesTable.$inferSelect;
export type NewSalary = typeof salariesTable.$inferInsert;

export const storesTable = pgTable("stores", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  logo:        text("logo"),
  type:        businessTypeEnum("type").notNull().default("RETAIL"),
  country:     text("country").notNull().default("Universe"),
  city:        text("city"),
  address:     text("address"),
  isOnline:    boolean("is_online").notNull().default(true),
  isActive:    boolean("is_active").notNull().default(true),
  rating:      real("rating").notNull().default(0),
  totalSales:  real("total_sales").notNull().default(0),
  productCount: integer("product_count").notNull().default(0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("stores_company_idx").on(t.companyId),
]);

export type Store = typeof storesTable.$inferSelect;
export type NewStore = typeof storesTable.$inferInsert;

export const warehousesTable = pgTable("warehouses", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  companyId:    text("company_id").notNull(),
  name:         text("name").notNull(),
  type:         warehouseTypeEnum("type").notNull().default("GENERAL"),
  description:  text("description"),
  location:     text("location"),
  capacity:     integer("capacity").notNull().default(1000),
  usedCapacity: integer("used_capacity").notNull().default(0),
  isActive:     boolean("is_active").notNull().default(true),
  managerId:    text("manager_id"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("warehouses_company_idx").on(t.companyId),
]);

export type Warehouse = typeof warehousesTable.$inferSelect;
export type NewWarehouse = typeof warehousesTable.$inferInsert;

export const warehouseItemsTable = pgTable("warehouse_items", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  warehouseId:  text("warehouse_id").notNull(),
  companyId:    text("company_id").notNull(),
  productId:    text("product_id"),
  name:         text("name").notNull(),
  sku:          text("sku"),
  quantity:     integer("quantity").notNull().default(0),
  minQuantity:  integer("min_quantity").notNull().default(0),
  maxQuantity:  integer("max_quantity").notNull().default(10000),
  unitCost:     real("unit_cost").notNull().default(0),
  totalValue:   real("total_value").notNull().default(0),
  location:     text("location"),
  expiresAt:    timestamp("expires_at"),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("warehouse_items_warehouse_idx").on(t.warehouseId),
  index("warehouse_items_company_idx").on(t.companyId),
]);

export type WarehouseItem = typeof warehouseItemsTable.$inferSelect;
export type NewWarehouseItem = typeof warehouseItemsTable.$inferInsert;

export const factoriesTable = pgTable("factories", {
  id:            text("id").primaryKey().$defaultFn(() => createId()),
  companyId:     text("company_id").notNull(),
  warehouseId:   text("warehouse_id"),
  name:          text("name").notNull(),
  description:   text("description"),
  type:          businessTypeEnum("type").notNull().default("MANUFACTURING"),
  location:      text("location"),
  capacity:      integer("capacity").notNull().default(100),
  workerCount:   integer("worker_count").notNull().default(0),
  productionRate: real("production_rate").notNull().default(1),
  isActive:      boolean("is_active").notNull().default(true),
  totalProduced: integer("total_produced").notNull().default(0),
  metadata:      jsonb("metadata"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("factories_company_idx").on(t.companyId),
]);

export type Factory = typeof factoriesTable.$inferSelect;
export type NewFactory = typeof factoriesTable.$inferInsert;

export const factoryRecipesTable = pgTable("factory_recipes", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  factoryId:    text("factory_id").notNull(),
  companyId:    text("company_id").notNull(),
  name:         text("name").notNull(),
  description:  text("description"),
  inputs:       jsonb("inputs").notNull(),
  outputs:      jsonb("outputs").notNull(),
  duration:     integer("duration").notNull().default(60),
  cost:         real("cost").notNull().default(0),
  isActive:     boolean("is_active").notNull().default(true),
  timesRun:     integer("times_run").notNull().default(0),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("factory_recipes_factory_idx").on(t.factoryId),
]);

export type FactoryRecipe = typeof factoryRecipesTable.$inferSelect;
export type NewFactoryRecipe = typeof factoryRecipesTable.$inferInsert;

export const brandsTable = pgTable("brands", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  logo:        text("logo"),
  coverImage:  text("cover_image"),
  country:     text("country").notNull().default("Universe"),
  type:        businessTypeEnum("type").notNull().default("OTHER"),
  isActive:    boolean("is_active").notNull().default(true),
  isVerified:  boolean("is_verified").notNull().default(false),
  rating:      real("rating").notNull().default(0),
  productCount: integer("product_count").notNull().default(0),
  followerCount: integer("follower_count").notNull().default(0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("brands_company_idx").on(t.companyId),
]);

export type Brand = typeof brandsTable.$inferSelect;
export type NewBrand = typeof brandsTable.$inferInsert;

export const productsTable = pgTable("products", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  brandId:     text("brand_id"),
  storeId:     text("store_id"),
  factoryId:   text("factory_id"),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  images:      jsonb("images"),
  sku:         text("sku"),
  price:       real("price").notNull().default(0),
  cost:        real("cost").notNull().default(0),
  stock:       integer("stock").notNull().default(0),
  minStock:    integer("min_stock").notNull().default(0),
  category:    text("category"),
  tags:        jsonb("tags"),
  isActive:    boolean("is_active").notNull().default(true),
  isFeatured:  boolean("is_featured").notNull().default(false),
  rating:      real("rating").notNull().default(0),
  totalSold:   integer("total_sold").notNull().default(0),
  totalRevenue: real("total_revenue").notNull().default(0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("products_company_idx").on(t.companyId),
  index("products_brand_idx").on(t.brandId),
  index("products_store_idx").on(t.storeId),
]);

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;

export const businessAssetsTable = pgTable("business_assets", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  companyId:    text("company_id").notNull(),
  name:         text("name").notNull(),
  type:         assetTypeEnum("type").notNull(),
  description:  text("description"),
  value:        real("value").notNull().default(0),
  purchasedAt:  timestamp("purchased_at"),
  depreciatedValue: real("depreciated_value").notNull().default(0),
  location:     text("location"),
  isActive:     boolean("is_active").notNull().default(true),
  metadata:     jsonb("metadata"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("business_assets_company_idx").on(t.companyId),
]);

export type BusinessAsset = typeof businessAssetsTable.$inferSelect;
export type NewBusinessAsset = typeof businessAssetsTable.$inferInsert;

export const businessTransactionsTable = pgTable("business_transactions", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  type:        businessTransactionTypeEnum("type").notNull(),
  amount:      real("amount").notNull(),
  currency:    text("currency").notNull().default("USD"),
  description: text("description").notNull(),
  reference:   text("reference"),
  fromParty:   text("from_party"),
  toParty:     text("to_party"),
  relatedId:   text("related_id"),
  relatedType: text("related_type"),
  balanceAfter: real("balance_after").notNull().default(0),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("business_transactions_company_idx").on(t.companyId),
  index("business_transactions_type_idx").on(t.type),
]);

export type BusinessTransaction = typeof businessTransactionsTable.$inferSelect;
export type NewBusinessTransaction = typeof businessTransactionsTable.$inferInsert;

export const businessInvoicesTable = pgTable("business_invoices", {
  id:           text("id").primaryKey().$defaultFn(() => createId()),
  companyId:    text("company_id").notNull(),
  number:       text("number").notNull().unique(),
  clientName:   text("client_name").notNull(),
  clientEmail:  text("client_email"),
  status:       invoiceStatusEnum("status").notNull().default("DRAFT"),
  items:        jsonb("items").notNull(),
  subtotal:     real("subtotal").notNull().default(0),
  tax:          real("tax").notNull().default(0),
  total:        real("total").notNull().default(0),
  dueAt:        timestamp("due_at"),
  paidAt:       timestamp("paid_at"),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("business_invoices_company_idx").on(t.companyId),
  index("business_invoices_status_idx").on(t.status),
]);

export type BusinessInvoice = typeof businessInvoicesTable.$inferSelect;
export type NewBusinessInvoice = typeof businessInvoicesTable.$inferInsert;

export const businessLogsTable = pgTable("business_logs", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  userId:      text("user_id"),
  action:      text("action").notNull(),
  entity:      text("entity").notNull(),
  entityId:    text("entity_id"),
  description: text("description").notNull(),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("business_logs_company_idx").on(t.companyId),
]);

export type BusinessLog = typeof businessLogsTable.$inferSelect;
export type NewBusinessLog = typeof businessLogsTable.$inferInsert;

export const businessStatisticsTable = pgTable("business_statistics", {
  id:               text("id").primaryKey().$defaultFn(() => createId()),
  companyId:        text("company_id").notNull().unique(),
  totalRevenue:     real("total_revenue").notNull().default(0),
  totalExpenses:    real("total_expenses").notNull().default(0),
  totalProfit:      real("total_profit").notNull().default(0),
  totalPayroll:     real("total_payroll").notNull().default(0),
  totalTransactions: integer("total_transactions").notNull().default(0),
  totalEmployees:   integer("total_employees").notNull().default(0),
  totalDepartments: integer("total_departments").notNull().default(0),
  totalStores:      integer("total_stores").notNull().default(0),
  totalWarehouses:  integer("total_warehouses").notNull().default(0),
  totalFactories:   integer("total_factories").notNull().default(0),
  totalProducts:    integer("total_products").notNull().default(0),
  totalBrands:      integer("total_brands").notNull().default(0),
  monthlyRevenue:   jsonb("monthly_revenue"),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("business_statistics_company_idx").on(t.companyId),
]);

export type BusinessStatistic = typeof businessStatisticsTable.$inferSelect;
export type NewBusinessStatistic = typeof businessStatisticsTable.$inferInsert;

export const businessReviewsTable = pgTable("business_reviews", {
  id:          text("id").primaryKey().$defaultFn(() => createId()),
  companyId:   text("company_id").notNull(),
  reviewerId:  text("reviewer_id").notNull(),
  rating:      integer("rating").notNull(),
  title:       text("title"),
  content:     text("content").notNull(),
  isVerified:  boolean("is_verified").notNull().default(false),
  isHelpful:   integer("is_helpful").notNull().default(0),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("business_reviews_company_idx").on(t.companyId),
  index("business_reviews_reviewer_idx").on(t.reviewerId),
]);

export type BusinessReview = typeof businessReviewsTable.$inferSelect;
export type NewBusinessReview = typeof businessReviewsTable.$inferInsert;

export const companyFollowersTable = pgTable("company_followers", {
  id:         text("id").primaryKey().$defaultFn(() => createId()),
  companyId:  text("company_id").notNull(),
  userId:     text("user_id").notNull(),
  followedAt: timestamp("followed_at").notNull().defaultNow(),
}, (t) => [
  index("company_followers_company_idx").on(t.companyId),
  index("company_followers_user_idx").on(t.userId),
]);

export type CompanyFollower = typeof companyFollowersTable.$inferSelect;
export type NewCompanyFollower = typeof companyFollowersTable.$inferInsert;

export const companySettingsTable = pgTable("company_settings", {
  id:                  text("id").primaryKey().$defaultFn(() => createId()),
  companyId:           text("company_id").notNull().unique(),
  currency:            text("currency").notNull().default("USD"),
  timezone:            text("timezone").notNull().default("UTC"),
  allowPublicReviews:  boolean("allow_public_reviews").notNull().default(true),
  allowPublicEmployees: boolean("allow_public_employees").notNull().default(false),
  autoPayroll:         boolean("auto_payroll").notNull().default(false),
  notifyOnHire:        boolean("notify_on_hire").notNull().default(true),
  notifyOnFire:        boolean("notify_on_fire").notNull().default(true),
  notifyOnPayroll:     boolean("notify_on_payroll").notNull().default(true),
  notifyOnRevenue:     boolean("notify_on_revenue").notNull().default(true),
  features:            jsonb("features"),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
});

export type CompanySetting = typeof companySettingsTable.$inferSelect;
export type NewCompanySetting = typeof companySettingsTable.$inferInsert;
