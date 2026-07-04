import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Ban, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import PageShell from "../components/PageShell";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import { ErrorState, TableSkeleton } from "../components/StateViews";

const PAGE_SIZE = 8;

export default function UsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch {
      setError("Couldn't load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(u) {
    const nextActive = !(u.isActive ?? true);
    if (!nextActive && !confirm(`Disable ${u.name}'s account? They won't be able to sign in.`)) {
      return;
    }
    setUpdatingId(u._id);
    try {
      const updated = await api.updateUserStatus(u._id, nextActive);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? updated : x)));
    } catch {
      setError("Couldn't update that user. Try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    let list = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return list;
  }, [users, roleFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <PageShell title="Users">
        <TableSkeleton cols={4} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Users">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {["all", "user", "pharmacy", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
                roleFilter === r ? "bg-bottle text-paper border-bottle" : "border-hairline text-ink-soft hover:bg-paper-dim"
              }`}
            >
              {r === "user" ? "patients" : r}
            </button>
          ))}
        </div>
        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            className="input pl-8 py-1.5 text-sm"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <p className="text-ink font-medium mb-1">No users here</p>
          <p className="text-ink-soft text-sm">Try a different filter or search.</p>
        </div>
      ) : (
        <>
          <div className="ledger-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper-dim/60 text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium w-32"></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => {
                  const active = u.isActive ?? true;
                  const isSelf = u._id === currentAdmin?.id;
                  return (
                    <tr key={u._id} className="border-b border-hairline last:border-0">
                      <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                      <td className="px-5 py-3 text-ink-soft">{u.email}</td>
                      <td className="px-5 py-3"><Badge label={u.role} variant="neutral" /></td>
                      <td className="px-5 py-3">
                        {active ? <Badge label="Active" variant="success" /> : <Badge label="Disabled" variant="danger" />}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-ink-soft">You</span>
                        ) : active ? (
                          <button
                            onClick={() => handleToggle(u)}
                            disabled={updatingId === u._id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-rust hover:text-rust/80 disabled:opacity-50"
                          >
                            <Ban size={13} /> Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggle(u)}
                            disabled={updatingId === u._id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-sage hover:text-sage/80 disabled:opacity-50"
                          >
                            <RotateCcw size={13} /> Re-enable
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        </>
      )}
    </PageShell>
  );
}