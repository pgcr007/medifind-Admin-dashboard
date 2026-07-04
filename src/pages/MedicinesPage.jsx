import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Search, X } from "lucide-react";
import * as api from "../api/endpoints";
import PageShell from "../components/PageShell";
import Pagination from "../components/Pagination";
import { ErrorState, TableSkeleton } from "../components/StateViews";

const PAGE_SIZE = 15;

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listMedicines({ name: appliedSearch || undefined, page, limit: PAGE_SIZE });
      setMedicines(data.medicines);
      setTotal(data.total);
    } catch {
      setError("Couldn't load medicines.");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageShell
      title="Medicine Catalog"
      action={
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 rounded bg-bottle text-paper text-sm font-medium px-4 py-2 hover:bg-bottle-dark transition-colors"
        >
          <Plus size={16} /> New medicine
        </button>
      }
    >
      <form onSubmit={handleSearchSubmit} className="relative mb-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          className="input pl-9 py-2 text-sm"
          placeholder="Search catalog…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {loading ? (
        <TableSkeleton cols={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : medicines.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <p className="text-ink font-medium mb-1">No medicines found</p>
          <p className="text-ink-soft text-sm">{appliedSearch ? "Try a different search." : "The catalog is empty."}</p>
        </div>
      ) : (
        <>
          <div className="ledger-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper-dim/60 text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Generic name</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m._id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{m.genericName || "—"}</td>
                    <td className="px-5 py-3 text-ink-soft">{m.category || "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setEditing(m)} className="text-ink-soft hover:text-bottle transition-colors" aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={PAGE_SIZE} />
        </>
      )}

      {showCreate && (
        <MedicineModal
          title="New medicine"
          onClose={() => setShowCreate(false)}
          onSubmit={async (values) => {
            await api.createMedicine(values);
            setShowCreate(false);
            setPage(1);
            load();
          }}
        />
      )}

      {editing && (
        <MedicineModal
          title="Edit medicine"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            const updated = await api.updateMedicine(editing._id, values);
            setMedicines((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
            setEditing(null);
          }}
        />
      )}
    </PageShell>
  );
}

function MedicineModal({ title, initial, onClose, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [genericName, setGenericName] = useState(initial?.genericName || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({ name: name.trim(), genericName: genericName.trim(), category: category.trim() });
    } catch {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
      <div className="ledger-card bg-white w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-ink-soft hover:text-ink" aria-label="Close">
          <X size={18} />
        </button>
        <h2 className="font-display text-xl text-ink mb-5">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">Name</span>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label className="block">
            <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">Generic name</span>
            <input className="input" value={genericName} onChange={(e) => setGenericName(e.target.value)} placeholder="e.g. Paracetamol — used to group alternatives" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">Category</span>
            <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Pain Relief" />
          </label>

          {error && <p className="text-sm text-rust">{error}</p>}

          <button type="submit" disabled={saving} className="w-full rounded bg-bottle text-paper text-sm font-medium py-2.5 hover:bg-bottle-dark disabled:opacity-60 transition-colors">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}