export type ModuleCategory =
  | "Economy"
  | "AI"
  | "XR"
  | "Social"
  | "Education"
  | "Gaming"
  | "Infrastructure";

export type ModuleType = "internal" | "external" | "coming-soon";

export type ModuleStatus = "active" | "disabled";

export interface RegistryModule {
  id: string;
  name: string;
  category: ModuleCategory;
  type: ModuleType;
  url: string;
  status: ModuleStatus;
  version: string;
  createdAt: string;
}

const MOCK_MODULES: RegistryModule[] = [
  {
    id: "MOD-001",
    name: "World Creator",
    category: "XR",
    type: "internal",
    url: "/worlds",
    status: "active",
    version: "3.2.1",
    createdAt: "2024-01-15",
  },
  {
    id: "MOD-002",
    name: "Football Universe",
    category: "Gaming",
    type: "external",
    url: "https://football-ai.replit.app",
    status: "active",
    version: "2.8.0",
    createdAt: "2024-02-03",
  },
  {
    id: "MOD-003",
    name: "Animal Evolution",
    category: "AI",
    type: "external",
    url: "https://animal-universe.replit.app",
    status: "active",
    version: "1.5.4",
    createdAt: "2024-02-20",
  },
  {
    id: "MOD-004",
    name: "SafePass",
    category: "Economy",
    type: "coming-soon",
    url: "",
    status: "disabled",
    version: "0.9.0",
    createdAt: "2024-03-10",
  },
  {
    id: "MOD-005",
    name: "Exchange Hub",
    category: "Economy",
    type: "coming-soon",
    url: "",
    status: "disabled",
    version: "0.7.2",
    createdAt: "2024-03-18",
  },
  {
    id: "MOD-006",
    name: "AI Companion",
    category: "AI",
    type: "coming-soon",
    url: "",
    status: "disabled",
    version: "0.3.0",
    createdAt: "2024-04-01",
  },
  {
    id: "MOD-007",
    name: "XR Worlds",
    category: "XR",
    type: "coming-soon",
    url: "",
    status: "disabled",
    version: "0.2.0",
    createdAt: "2024-04-15",
  },
  {
    id: "MOD-008",
    name: "EduVerse",
    category: "Education",
    type: "external",
    url: "https://eduverse.replit.app",
    status: "active",
    version: "1.1.0",
    createdAt: "2024-05-02",
  },
  {
    id: "MOD-009",
    name: "Community Hub",
    category: "Social",
    type: "internal",
    url: "/community",
    status: "active",
    version: "2.0.3",
    createdAt: "2024-05-20",
  },
  {
    id: "MOD-010",
    name: "Ledger Core",
    category: "Infrastructure",
    type: "internal",
    url: "/ledger",
    status: "active",
    version: "4.1.0",
    createdAt: "2024-06-01",
  },
];

let store: RegistryModule[] = [...MOCK_MODULES];

function generateId(): string {
  const maxNum = store.reduce((max, m) => {
    const n = parseInt(m.id.replace("MOD-", ""), 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return `MOD-${String(maxNum + 1).padStart(3, "0")}`;
}

// TODO: Replace with API call — GET /api/modules
export async function fetchModules(): Promise<RegistryModule[]> {
  await delay(120);
  return [...store];
}

// TODO: Replace with API call — POST /api/modules
export async function createModule(
  input: Omit<RegistryModule, "id" | "createdAt">
): Promise<RegistryModule> {
  await delay(180);
  const module: RegistryModule = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString().split("T")[0],
  };
  store = [module, ...store];
  return module;
}

// TODO: Replace with API call — PATCH /api/modules/:id
export async function updateModule(
  id: string,
  patch: Partial<Omit<RegistryModule, "id" | "createdAt">>
): Promise<RegistryModule> {
  await delay(180);
  store = store.map((m) => (m.id === id ? { ...m, ...patch } : m));
  const updated = store.find((m) => m.id === id);
  if (!updated) throw new Error(`Module ${id} not found`);
  return updated;
}

// TODO: Replace with API call — DELETE /api/modules/:id
export async function deleteModule(id: string): Promise<void> {
  await delay(150);
  store = store.filter((m) => m.id !== id);
}

// TODO: Replace with API call — PATCH /api/modules/:id/status
export async function toggleModuleStatus(id: string): Promise<RegistryModule> {
  await delay(120);
  const module = store.find((m) => m.id === id);
  if (!module) throw new Error(`Module ${id} not found`);
  const newStatus: ModuleStatus = module.status === "active" ? "disabled" : "active";
  return updateModule(id, { status: newStatus });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MODULE_CATEGORIES: ModuleCategory[] = [
  "Economy",
  "AI",
  "XR",
  "Social",
  "Education",
  "Gaming",
  "Infrastructure",
];

export const MODULE_TYPES: ModuleType[] = ["internal", "external", "coming-soon"];
