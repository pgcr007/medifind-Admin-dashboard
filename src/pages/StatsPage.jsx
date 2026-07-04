import { useState, useEffect, useCallback } from "react";
import { Users, Store, Pill, Package, ClipboardList } from "lucide-react";
import * as api from "../api/endpoints";
import PageShell from "../components/PageShell";
import { ErrorState, TableSkeleton } from "../components/StateViews";

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {
      setError("Couldn't load stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageShell title="Overview">
        <TableSkeleton rows={3} cols={3} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Overview">
        <ErrorState message={error} onRetry={load} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Overview">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Users}
          title="Users"
          primary={stats.users.patients}
          primaryLabel="patients"
          rows={[
            ["Pharmacy owners", stats.users.pharmacyOwners],
            ["Admins", stats.users.admins],
          ]}
        />
        <StatCard
          icon={Store}
          title="Pharmacies"
          primary={stats.pharmacies.total}
          primaryLabel="total"
          rows={[
            ["Verified", stats.pharmacies.verified],
            ["Pending", stats.pharmacies.pending],
          ]}
          accent={stats.pharmacies.pending > 0 ? "amber" : undefined}
        />
        <StatCard icon={Pill} title="Catalog" primary={stats.medicines.total} primaryLabel="medicines" />
        <StatCard icon={Package} title="Inventory" primary={stats.inventory.totalItems} primaryLabel="stocked items" />
        <StatCard
          icon={ClipboardList}
          title="Reservations"
          primary={
            stats.reservations.pending +
            stats.reservations.confirmed +
            stats.reservations.rejected +
            stats.reservations.cancelled
          }
          primaryLabel="total"
          rows={[
            ["Pending", stats.reservations.pending],
            ["Confirmed", stats.reservations.confirmed],
            ["Rejected", stats.reservations.rejected],
            ["Cancelled", stats.reservations.cancelled],
          ]}
        />
      </div>
    </PageShell>
  );
}

function StatCard({ icon: Icon, title, primary, primaryLabel, rows = [], accent }) {
  return (
    <div className="ledger-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={accent === "amber" ? "text-amber" : "text-ink-soft"} />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{title}</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="font-display text-3xl text-ink">{primary}</span>
        <span className="text-xs text-ink-soft">{primaryLabel}</span>
      </div>
      {rows.length > 0 && (
        <div className="space-y-1 pt-3 border-t border-hairline">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-ink-soft">{label}</span>
              <span className="font-mono text-ink">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}