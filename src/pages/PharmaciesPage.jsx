import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, X as XIcon, Search } from "lucide-react";
import * as api from "../api/endpoints";
import PageShell from "../components/PageShell";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { ErrorState, TableSkeleton } from "../components/StateViews";

const PAGE_SIZE = 8;

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listPharmacies();
      setPharmacies(data);
    } catch {
      setError("Couldn't load pharmacies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVerify(id, verified) {
    setUpdatingId(id);
    try {
      const updated = await api.verifyPharmacy(id, verified);
      setPharmacies((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch {
      setError("Couldn't update that pharmacy. Try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    let list = pharmacies;
    if (filter === "verified") list = list.filter((p) => p.verified);
    if (filter === "pending") list = list.filter((p) => !p.verified);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.ownerUserId?.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pharmacies, filter, search]);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <PageShell title="Pharmacies">
        <TableSkeleton cols={4} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Pharmacies">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {["all", "pending", "verified"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
                filter === f ? "bg-bottle text-paper border-bottle" : "border-hairline text-ink-soft hover:bg-paper-dim"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            className="input pl-8 py-1.5 text-sm"
            placeholder="Search name, address, owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <p className="text-ink font-medium mb-1">No pharmacies here</p>
          <p className="text-ink-soft text-sm">
            {pharmacies.length === 0 ? "None registered yet." : "Try a different filter or search."}
          </p>
        </div>
      ) : (
        <>
          <div className="ledger-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper-dim/60 text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-medium">Pharmacy</th>
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium w-44"></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p._id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{p.name}</div>
                      <div className="text-xs text-ink-soft">{p.address}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-ink">{p.ownerUserId?.name || "—"}</div>
                      <div className="text-xs text-ink-soft">{p.ownerUserId?.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      {p.verified ? <Badge label="Verified" variant="success" /> : <Badge label="Pending" variant="warning" />}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!p.verified ? (
                        <button
                          onClick={() => handleVerify(p._id, true)}
                          disabled={updatingId === p._id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-sage hover:text-sage/80 disabled:opacity-50"
                        >
                          <Check size={14} /> Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(p._id, false)}
                          disabled={updatingId === p._id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-rust disabled:opacity-50"
                        >
                          <XIcon size={14} /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        </>
      )}
    </PageShell>
  );
}