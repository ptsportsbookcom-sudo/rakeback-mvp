import { useEffect, useState } from "react";

interface RakebackSummary {
  totalWagered: number;
  totalClaimed: number;
  claimableRakeback: number;
  pendingRakeback: number;
  casinoRakebackTotal: number;
  sportsRakebackTotal: number;
  wagersCount: number;
  claimsCount: number;
}

interface Claim {
  id: string;
  amount: number;
  createdAt: string;
  wagerIds: string[];
}

interface StatusResponse {
  summary: RakebackSummary;
}

interface ClaimHistoryResponse {
  claims: Claim[];
}

interface PlayerState {
  loading: boolean;
  error: string | null;
  claiming: boolean;
  summary: RakebackSummary | null;
  claims: Claim[];
  lastClaim?: Claim;
}

const formatCurrency = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString();

export default function PlayerRakebackPage() {
  const [state, setState] = useState<PlayerState>({
    loading: true,
    error: null,
    claiming: false,
    summary: null,
    claims: [],
  });

  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch("/api/rakeback/status"),
        fetch("/api/rakeback/claim-history"),
      ]);

      if (!statusRes.ok) {
        throw new Error("Failed to load status");
      }
      if (!historyRes.ok) {
        throw new Error("Failed to load claim history");
      }

      const statusJson = (await statusRes.json()) as StatusResponse;
      const historyJson = (await historyRes.json()) as ClaimHistoryResponse;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        summary: statusJson.summary,
        claims: historyJson.claims,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Unable to load rakeback status",
      }));
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleClaim = async () => {
    setState((prev) => ({ ...prev, claiming: true, error: null, lastClaim: undefined }));
    try {
      const res = await fetch("/api/rakeback/claim", {
        method: "POST",
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        const message = err.error ?? "Failed to claim rakeback";
        setState((prev) => ({
          ...prev,
          claiming: false,
          error: message,
        }));
        return;
      }

      const data = (await res.json()) as { claim: Claim };

      // Reload status + history after a claim to keep everything in sync.
      const [statusRes, historyRes] = await Promise.all([
        fetch("/api/rakeback/status"),
        fetch("/api/rakeback/claim-history"),
      ]);

      if (!statusRes.ok || !historyRes.ok) {
        throw new Error("Claim succeeded but failed to refresh status");
      }

      const statusJson = (await statusRes.json()) as StatusResponse;
      const historyJson = (await historyRes.json()) as ClaimHistoryResponse;

      setState((prev) => ({
        ...prev,
        claiming: false,
        error: null,
        summary: statusJson.summary,
        claims: historyJson.claims,
        lastClaim: data.claim,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        claiming: false,
        error: "Failed to claim rakeback",
      }));
    }
  };

  const { summary } = state;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Player Rakeback
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              View accrued rakeback and manually claim rewards.
            </p>
          </div>
          <nav className="flex gap-3 text-sm">
            <a
              href="/admin"
              className="rounded-full bg-neutral-900 px-3 py-1 text-neutral-300 hover:bg-neutral-800"
            >
              Admin
            </a>
            <a
              href="/admin/simulator"
              className="rounded-full bg-neutral-900 px-3 py-1 text-neutral-300 hover:bg-neutral-800"
            >
              Simulator
            </a>
            <a
              href="/player/rakeback"
              className="rounded-full bg-neutral-800 px-3 py-1 font-medium text-neutral-100"
            >
              Player View
            </a>
          </nav>
        </header>

        {state.loading && (
          <p className="text-sm text-neutral-400">Loading rakeback…</p>
        )}

        {state.error && (
          <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {state.error}
          </div>
        )}

        {summary && (
          <>
            <section className="grid gap-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Total Wagered
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(summary.totalWagered)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Across {summary.wagersCount} wagers
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Pending Rakeback
                </p>
                <p className="mt-1 text-lg font-semibold text-amber-300">
                  {formatCurrency(summary.pendingRakeback)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Not yet claimed
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Total Claimed
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">
                  {formatCurrency(summary.totalClaimed)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {summary.claimsCount} claim(s)
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Claimable Now
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-400">
                  {formatCurrency(summary.claimableRakeback)}
                </p>
                <button
                  type="button"
                  disabled={
                    state.claiming || summary.claimableRakeback <= 0
                  }
                  onClick={handleClaim}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
                >
                  {state.claiming ? "Claiming…" : "Claim Rakeback"}
                </button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  Breakdown
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <span className="text-neutral-300">Casino Rakeback</span>
                    <span className="font-mono">
                      {formatCurrency(summary.casinoRakebackTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <span className="text-neutral-300">Sportsbook Rakeback</span>
                    <span className="font-mono">
                      {formatCurrency(summary.sportsRakebackTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                    <span className="text-neutral-400 text-xs">
                      Total Accrued (Casino + Sports)
                    </span>
                    <span className="font-mono text-xs">
                      {formatCurrency(
                        summary.casinoRakebackTotal +
                          summary.sportsRakebackTotal,
                      )}
                    </span>
                  </div>
                </div>
                {state.lastClaim && (
                  <div className="mt-3 rounded-md border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-100">
                    <p className="font-semibold">Last Claim</p>
                    <p className="mt-1">
                      Amount:{" "}
                      <span className="font-mono">
                        {formatCurrency(state.lastClaim.amount)}
                      </span>
                    </p>
                    <p>
                      Time:{" "}
                      <span className="font-mono">
                        {formatDateTime(state.lastClaim.createdAt)}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  Claim History
                </h2>
                {state.claims.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    No claims yet. Generate some wagers in the simulator, then
                    claim here.
                  </p>
                ) : (
                  <div className="max-h-72 overflow-auto rounded-md border border-neutral-800 bg-neutral-950/40">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-neutral-950/80 text-neutral-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Time</th>
                          <th className="px-3 py-2 font-medium">Amount</th>
                          <th className="px-3 py-2 font-medium">Wagers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.claims.map((claim) => (
                          <tr
                            key={claim.id}
                            className="border-t border-neutral-800/80"
                          >
                            <td className="px-3 py-2 align-top text-neutral-200">
                              {formatDateTime(claim.createdAt)}
                            </td>
                            <td className="px-3 py-2 align-top font-mono text-emerald-300">
                              {formatCurrency(claim.amount)}
                            </td>
                            <td className="px-3 py-2 align-top text-neutral-400">
                              <span className="font-mono">
                                {claim.wagerIds.length}
                              </span>{" "}
                              wager(s)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}


