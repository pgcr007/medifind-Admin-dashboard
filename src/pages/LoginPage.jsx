import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err.message === "NOT_ADMIN") {
        setError("This dashboard is for admin accounts only.");
      } else {
        const status = err.response?.status;
        setError(
          status === 401 || status === 400
            ? "Email or password is incorrect."
            : "Couldn't reach the server. It may be waking up — try again in a moment."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      <div className="hidden lg:flex flex-col justify-between bg-bottle text-paper px-16 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 31px, currentColor 31px, currentColor 32px)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <RxStamp />
          <span className="font-display text-2xl tracking-tight">MediFind</span>
        </div>
        <div className="relative space-y-4 max-w-md">
          <p className="font-display text-4xl leading-tight">The registry office.</p>
          <p className="text-paper/70 font-body text-base leading-relaxed">
            Verify pharmacies, manage the medicine catalog, and keep an eye
            on the whole network from one place.
          </p>
        </div>
        <p className="relative text-xs text-paper/50 font-mono">Admin Dashboard</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <RxStamp small />
            <span className="font-display text-xl text-ink">MediFind</span>
          </div>

          <h1 className="font-display text-3xl text-ink mb-1">Admin sign in</h1>
          <p className="text-ink-soft text-sm mb-8">Restricted to admin accounts.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@yourdomain.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded border border-rust/30 bg-rust-light px-3.5 py-2.5 text-sm text-rust">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-bottle text-paper font-medium py-2.5 hover:bg-bottle-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function RxStamp({ small }) {
  const size = small ? 36 : 44;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="21" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <text x="22" y="29" textAnchor="middle" fontFamily="'Zilla Slab', serif" fontSize="18" fontWeight="600" fill="currentColor">
        Rx
      </text>
    </svg>
  );
}