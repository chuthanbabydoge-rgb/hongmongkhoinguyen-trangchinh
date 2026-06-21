import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import {
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
  toggleModuleStatus,
  MODULE_CATEGORIES,
  MODULE_TYPES,
  type RegistryModule,
  type ModuleCategory,
  type ModuleType,
  type ModuleStatus,
} from "@/lib/moduleRegistry";
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  Package,
  CheckCircle2,
  Ban,
  AlertCircle,
  ExternalLink,
  Globe,
  Cpu,
  Loader2,
} from "lucide-react";

const CATEGORY_COLORS: Record<ModuleCategory, { text: string; bg: string; border: string }> = {
  Economy:        { text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30" },
  AI:             { text: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/30" },
  XR:             { text: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/30" },
  Social:         { text: "text-pink-400",    bg: "bg-pink-400/10",    border: "border-pink-400/30" },
  Education:      { text: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/30" },
  Gaming:         { text: "text-teal-400",    bg: "bg-teal-400/10",    border: "border-teal-400/30" },
  Infrastructure: { text: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/30" },
};

const TYPE_META: Record<ModuleType, { label: string; text: string; bg: string }> = {
  "internal":     { label: "INTERNAL",     text: "text-primary",      bg: "bg-primary/10" },
  "external":     { label: "EXTERNAL",     text: "text-purple-300",   bg: "bg-purple-400/10" },
  "coming-soon":  { label: "COMING SOON",  text: "text-zinc-400",     bg: "bg-zinc-400/10" },
};

const STATUS_META: Record<ModuleStatus, { label: string; text: string; bg: string; border: string }> = {
  active:   { label: "ACTIVE",    text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  disabled: { label: "DISABLED",  text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/30" },
};

type SortKey = "id" | "name" | "category" | "status" | "version";

interface FormData {
  name: string;
  category: ModuleCategory;
  type: ModuleType;
  url: string;
  status: ModuleStatus;
  version: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  category: "Gaming",
  type: "internal",
  url: "",
  status: "active",
  version: "1.0.0",
};

function Spinner() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}

function StatusBadge({ status }: { status: ModuleStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest border", m.text, m.bg, m.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "active" ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
      {m.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: ModuleCategory }) {
  const c = CATEGORY_COLORS[category];
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest border", c.text, c.bg, c.border)}>
      {category.toUpperCase()}
    </span>
  );
}

function TypeBadge({ type }: { type: ModuleType }) {
  const m = TYPE_META[type];
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest", m.text, m.bg)}>
      {m.label}
    </span>
  );
}

interface ModalProps {
  mode: "add" | "edit";
  initial: FormData;
  editId?: string;
  onClose: () => void;
  onSave: (data: FormData, editId?: string) => Promise<void>;
}

function ModuleModal({ mode, initial, editId, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<FormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Module name is required."); return; }
    if (!form.version.trim()) { setError("Version is required."); return; }
    setError("");
    setSaving(true);
    try {
      await onSave(form, editId);
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-mono";
  const labelCls = "block text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-1.5";

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="glass-panel border border-white/10 rounded-2xl w-full max-w-lg mx-4 shadow-2xl" style={{ animation: "fadeInDown 0.2s ease-out" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {mode === "add" ? "Add New Module" : "Edit Module"}
          </h2>
          <button onClick={onClose} data-testid="modal-close" className="text-muted-foreground/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {mode === "edit" && editId && (
            <div>
              <label className={labelCls}>Module ID</label>
              <div className="w-full bg-white/3 border border-white/5 rounded-lg px-3 py-2 text-sm text-muted-foreground/50 font-mono">
                {editId}
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Module Name *</label>
            <input
              data-testid="input-module-name"
              className={inputCls}
              placeholder="e.g. Trade Engine"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select
                data-testid="input-category"
                className={inputCls}
                value={form.category}
                onChange={(e) => set("category", e.target.value as ModuleCategory)}
              >
                {MODULE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select
                data-testid="input-type"
                className={inputCls}
                value={form.type}
                onChange={(e) => set("type", e.target.value as ModuleType)}
              >
                {MODULE_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_META[t].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Version *</label>
              <input
                data-testid="input-version"
                className={inputCls}
                placeholder="e.g. 1.0.0"
                value={form.version}
                onChange={(e) => set("version", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                data-testid="input-status"
                className={inputCls}
                value={form.status}
                onChange={(e) => set("status", e.target.value as ModuleStatus)}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>URL</label>
            <input
              data-testid="input-url"
              className={inputCls}
              placeholder="e.g. /module-path or https://..."
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              data-testid="button-cancel"
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              data-testid="button-save"
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary text-xs font-mono font-bold tracking-widest uppercase hover:bg-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Spinner /> Saving…</> : (mode === "add" ? "Add Module" : "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteDialogProps {
  module: RegistryModule;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

function DeleteDialog({ module, onConfirm, onClose }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handle = async () => {
    setDeleting(true);
    try { await onConfirm(); onClose(); } catch { setDeleting(false); }
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="glass-panel border border-red-500/20 rounded-2xl w-full max-w-sm mx-4 shadow-2xl" style={{ animation: "fadeInDown 0.2s ease-out" }}>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Delete Module</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                This will permanently remove <span className="text-white font-mono">{module.name}</span> ({module.id}) from the registry.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              data-testid="button-cancel-delete"
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handle}
              disabled={deleting}
              data-testid="button-confirm-delete"
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold tracking-widest uppercase hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? <><Spinner /> Deleting…</> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModuleRegistry() {
  const [modules, setModules] = useState<RegistryModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<ModuleCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<null | { mode: "add" | "edit"; module?: RegistryModule }>(null);
  const [deleteTarget, setDeleteTarget] = useState<RegistryModule | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchModules().then((data) => { setModules(data); setLoading(false); });
  }, []);

  const reload = () => fetchModules().then(setModules);

  const handleSave = async (form: FormData, editId?: string) => {
    if (editId) {
      const updated = await updateModule(editId, form);
      setModules((prev) => prev.map((m) => (m.id === editId ? updated : m)));
    } else {
      const created = await createModule(form);
      setModules((prev) => [created, ...prev]);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteModule(id);
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const updated = await toggleModuleStatus(id);
      setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } finally {
      setTogglingId(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = modules
    .filter((m) => {
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.url.toLowerCase().includes(q);
      const matchCat = filterCategory === "all" || m.category === filterCategory;
      const matchStatus = filterStatus === "all" || m.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") cmp = a.id.localeCompare(b.id);
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "version") cmp = a.version.localeCompare(b.version);
      return sortAsc ? cmp : -cmp;
    });

  const total = modules.length;
  const activeCount = modules.filter((m) => m.status === "active").length;
  const disabledCount = modules.filter((m) => m.status === "disabled").length;

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => handleSort(k)}
      className={cn(
        "flex items-center gap-0.5 text-[10px] font-mono tracking-widest uppercase transition-colors whitespace-nowrap",
        sortKey === k ? "text-primary" : "text-muted-foreground/30 hover:text-white"
      )}
    >
      {label}
      {sortKey === k && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground scanline">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`, backgroundSize: "40px 40px" }}
        />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 max-w-full overflow-hidden">
        <Header />

        <main className="flex-1 p-6 overflow-auto space-y-5">
          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-sm shadow-[0_0_10px_hsl(var(--primary))]" />
              Module Registry
            </h1>
            <button
              onClick={() => setModal({ mode: "add" })}
              data-testid="button-add-module"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary text-xs font-mono font-bold tracking-widest uppercase hover:bg-primary/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Modules",    value: total,         icon: Package,       color: "text-primary",      bg: "bg-primary/10",      border: "border-primary/20" },
              { label: "Active",           value: activeCount,   icon: CheckCircle2,  color: "text-emerald-400",  bg: "bg-emerald-400/10",  border: "border-emerald-400/30" },
              { label: "Disabled",         value: disabledCount, icon: Ban,           color: "text-red-400",      bg: "bg-red-400/10",      border: "border-red-400/30" },
            ].map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={cn("glass-panel rounded-xl border p-4 flex items-center gap-4", border)}>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon className={cn("w-5 h-5", color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{loading ? "—" : value}</p>
                  <p className={cn("text-[10px] font-mono tracking-widest uppercase", color)}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & search */}
          <div className="glass-panel rounded-xl border border-white/5 px-5 py-3 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
              <input
                data-testid="input-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules..."
                className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 font-mono"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Cat</span>
              {(["all", ...MODULE_CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  data-testid={`filter-cat-${c}`}
                  onClick={() => setFilterCategory(c as ModuleCategory | "all")}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                    filterCategory === c
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
                  )}
                >
                  {c === "all" ? "ALL" : c}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Status</span>
              {(["all", "active", "disabled"] as const).map((s) => (
                <button
                  key={s}
                  data-testid={`filter-status-${s}`}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase border transition-all",
                    filterStatus === s
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20"
                  )}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[90px_1fr_110px_100px_90px_90px_80px_120px] gap-3 px-5 py-3 border-b border-white/5 bg-white/2">
              <SortBtn label="ID" k="id" />
              <SortBtn label="Name" k="name" />
              <SortBtn label="Category" k="category" />
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">Type</span>
              <SortBtn label="Status" k="status" />
              <SortBtn label="Version" k="version" />
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">URL</span>
              <span className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest text-right">Actions</span>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground/40 text-sm font-mono">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading modules…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Cpu className="w-8 h-8 text-muted-foreground/20" />
                <p className="text-muted-foreground/40 text-sm font-mono tracking-wider">NO MODULES MATCH FILTERS</p>
              </div>
            ) : (
              filtered.map((m, i) => (
                <div
                  key={m.id}
                  data-testid={`row-module-${m.id}`}
                  className={cn(
                    "grid grid-cols-[90px_1fr_110px_100px_90px_90px_80px_120px] gap-3 px-5 py-3.5 items-center transition-colors duration-150 hover:bg-white/3",
                    i !== filtered.length - 1 && "border-b border-white/5",
                    m.status === "disabled" && "opacity-60"
                  )}
                >
                  {/* ID */}
                  <span className="text-[11px] font-mono text-muted-foreground/50">{m.id}</span>

                  {/* Name */}
                  <span className="text-sm font-semibold text-white truncate">{m.name}</span>

                  {/* Category */}
                  <CategoryBadge category={m.category} />

                  {/* Type */}
                  <TypeBadge type={m.type} />

                  {/* Status */}
                  <StatusBadge status={m.status} />

                  {/* Version */}
                  <span className="text-xs font-mono text-muted-foreground/60">{m.version}</span>

                  {/* URL */}
                  {m.url ? (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-url-${m.id}`}
                      title={m.url}
                      className="text-primary/60 hover:text-primary transition-colors"
                    >
                      {m.url.startsWith("http") ? <ExternalLink className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/20 text-xs font-mono">—</span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {/* Toggle enable/disable */}
                    <button
                      onClick={() => handleToggle(m.id)}
                      disabled={togglingId === m.id}
                      data-testid={`button-toggle-${m.id}`}
                      title={m.status === "active" ? "Disable module" : "Enable module"}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all border",
                        m.status === "active"
                          ? "border-amber-400/20 text-amber-400/60 hover:bg-amber-400/10 hover:text-amber-400 hover:border-amber-400/40"
                          : "border-emerald-400/20 text-emerald-400/60 hover:bg-emerald-400/10 hover:text-emerald-400 hover:border-emerald-400/40"
                      )}
                    >
                      {togglingId === m.id ? <Spinner /> : m.status === "active" ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => setModal({ mode: "edit", module: m })}
                      data-testid={`button-edit-${m.id}`}
                      title="Edit module"
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-primary/20 text-primary/50 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(m)}
                      data-testid={`button-delete-${m.id}`}
                      title="Delete module"
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-red-400/20 text-red-400/50 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/40 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer count */}
          {!loading && (
            <p className="text-[10px] font-mono text-muted-foreground/30 text-right tracking-widest">
              SHOWING {filtered.length} OF {total} MODULES
            </p>
          )}
        </main>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <ModuleModal
          mode={modal.mode}
          initial={modal.module ? {
            name: modal.module.name,
            category: modal.module.category,
            type: modal.module.type,
            url: modal.module.url,
            status: modal.module.status,
            version: modal.module.version,
          } : EMPTY_FORM}
          editId={modal.module?.id}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteDialog
          module={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
