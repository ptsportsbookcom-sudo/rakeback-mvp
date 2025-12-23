import { useEffect, useState } from "react";
import type { RakebackConfig } from "@/lib/types";

interface ConfigState {
  loading: boolean;
  error: string | null;
  saving: boolean;
  config: RakebackConfig | null;
}

export default function AdminConfigPage() {
  const [state, setState] = useState<ConfigState>({
    loading: true,
    error: null,
    saving: false,
    config: null,
  });

  const loadConfig = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/rakeback/config");
      if (!res.ok) {
        throw new Error("Failed to load config");
      }
      const data = (await res.json()) as { config: RakebackConfig };
      setState({
        loading: false,
        error: null,
        saving: false,
        config: data.config,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Unable to load config",
      }));
    }
  };

  useEffect(() => {
    void loadConfig();
  }, []);

  const updateConfigField = <K extends keyof RakebackConfig>(
    key: K,
    value: RakebackConfig[K],
  ) => {
    setState((prev) =>
      prev.config
        ? {
            ...prev,
            config: {
              ...prev.config,
              [key]: value,
            },
          }
        : prev,
    );
  };

  const handleToggleEnabled = () => {
    if (!state.config) return;
    updateConfigField("enabled", !state.config.enabled);
  };

  const handleBasePercentageChange = (value: string) => {
    const parsed = Number.parseFloat(value);
    if (!state.config) return;
    if (!Number.isFinite(parsed) || parsed < 0) {
      updateConfigField("baseRakebackPercentage", 0);
      return;
    }
    // UI is percentage (e.g. 10), config stores decimal (0.10)
    updateConfigField("baseRakebackPercentage", parsed / 100);
  };

  const handleOverrideMultiplierChange = (value: string) => {
    const parsed = Number.parseFloat(value);
    if (!state.config) return;
    if (!Number.isFinite(parsed) || parsed < 0) {
      // For invalid or negative input, treat as 0 (rakeback off).
      updateConfigField("overrideMultiplier", 0);
      return;
    }
    updateConfigField("overrideMultiplier", parsed);
  };

  const handleCasinoEdgeCapChange = (value: string) => {
    if (!state.config) return;
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      updateConfigField("casinoEdgeCap", 0);
      return;
    }
    // UI is percentage (e.g. 10), config stores decimal (0.10)
    updateConfigField("casinoEdgeCap", parsed / 100);
  };

  const handleSportsEdgeCapChange = (value: string) => {
    if (!state.config) return;
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      updateConfigField("sportsEdgeCap", 0);
      return;
    }
    updateConfigField("sportsEdgeCap", parsed / 100);
  };

  const handleSave = async () => {
    if (!state.config) return;
    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const res = await fetch("/api/rakeback/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state.config),
      });
      if (!res.ok) {
        throw new Error("Failed to save config");
      }
      const data = (await res.json()) as { config: RakebackConfig };
      setState({
        loading: false,
        saving: false,
        error: null,
        config: data.config,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        saving: false,
        error: "Failed to save config",
      }));
    }
  };

  const basePercentageDisplay = state.config
    ? (state.config.baseRakebackPercentage * 100).toString()
    : "";

  const overrideMultiplierDisplay = state.config
    ? state.config.overrideMultiplier.toString()
    : "";

  const casinoEdgeCapDisplay = state.config
    ? (state.config.casinoEdgeCap * 100).toString()
    : "";

  const sportsEdgeCapDisplay = state.config
    ? (state.config.sportsEdgeCap * 100).toString()
    : "";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Rakeback Admin
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Configure rakeback parameters and floors for testing.
            </p>
          </div>
          <nav className="flex gap-3 text-sm">
            <a
              href="/admin"
              className="rounded-full bg-neutral-800 px-3 py-1 font-medium text-neutral-100"
            >
              Config
            </a>
            <a
              href="/admin/simulator"
              className="rounded-full bg-neutral-900 px-3 py-1 text-neutral-300 hover:bg-neutral-800"
            >
              Simulator
            </a>
            <a
              href="/player/rakeback"
              className="rounded-full border border-neutral-700 px-3 py-1 text-neutral-300 hover:bg-neutral-900"
            >
              Player View
            </a>
          </nav>
        </header>

        {state.loading && (
          <p className="text-sm text-neutral-400">Loading config…</p>
        )}

        {state.error && (
          <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {state.error}
          </div>
        )}

        {state.config && (
          <main className="grid gap-6 md:grid-cols-[1.5fr,1.5fr]">
            <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Global Settings
              </h2>

              <div className="flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Rakeback Status</p>
                  <p className="text-xs text-neutral-400">
                    Enable or disable rakeback accrual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    state.config.enabled
                      ? "bg-emerald-500 text-emerald-950"
                      : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {state.config.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Base Rakeback %
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={basePercentageDisplay}
                    onChange={(e) => handleBasePercentageChange(e.target.value)}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none ring-0 focus:border-emerald-500"
                  />
                  <p className="text-xs text-neutral-500">
                    Base rakeback rate (e.g. 10 for 10%).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Rakeback Multiplier
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={overrideMultiplierDisplay}
                    onChange={(e) =>
                      handleOverrideMultiplierChange(e.target.value)
                    }
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none ring-0 focus:border-emerald-500"
                  />
                  <p className="text-xs text-neutral-500">
                    0 = off, 1 = normal (100%), 0.5 = half, 2 = double.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Casino Edge Cap (Max Edge Used for Rakeback)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={casinoEdgeCapDisplay}
                    onChange={(e) => handleCasinoEdgeCapChange(e.target.value)}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none ring-0 focus:border-emerald-500"
                  />
                  <p className="text-xs text-neutral-500">
                    Maximum edge used for rakeback to prevent overpaying on
                    high-margin bets.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Sportsbook Edge Cap (Max Margin Used for Rakeback)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={sportsEdgeCapDisplay}
                    onChange={(e) => handleSportsEdgeCapChange(e.target.value)}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none ring-0 focus:border-emerald-500"
                  />
                  <p className="text-xs text-neutral-500">
                    Maximum margin used for rakeback to prevent overpaying on
                    high-margin bets.
                  </p>
                </div>
              </div>

              <div className="mt-2 text-xs text-neutral-500">
                Last updated:{" "}
                <span className="font-mono">
                  {new Date(state.config.updatedAt).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={state.saving}
                className="mt-3 inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
              >
                {state.saving ? "Saving…" : "Save Configuration"}
              </button>
            </section>

            {/* Right column intentionally left simple for now; floors removed. */}
          </main>
        )}
      </div>
    </div>
  );
}


