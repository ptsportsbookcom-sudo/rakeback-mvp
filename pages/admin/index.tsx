import { useEffect, useState } from "react";
import type {
  CasinoCategory,
  CasinoEdgeCapConfig,
  RakebackConfig,
  SportEdgeCapConfig,
  SportType,
} from "@/lib/types";

const casinoCategories: CasinoCategory[] = ["slots", "table", "live", "other"];
const sportTypes: SportType[] = ["soccer", "basketball", "tennis", "other"];

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

  const handleCasinoEdgeCapChange = (
    category: CasinoCategory,
    value: string,
  ): void => {
    if (!state.config) return;
    const parsed = Number.parseFloat(value);
    const cap = !Number.isFinite(parsed) || parsed < 0 ? 0 : parsed / 100;

    const updated: CasinoEdgeCapConfig[] = casinoCategories.map((cat) => {
      const existing =
        state.config?.casinoEdgeCaps.find((c) => c.category === cat) ?? null;
      if (cat === category) {
        return { category: cat, cap };
      }
      return existing ?? { category: cat, cap: 0 };
    });

    updateConfigField("casinoEdgeCaps", updated);
  };

  const handleSportEdgeCapChange = (sport: SportType, value: string): void => {
    if (!state.config) return;
    const parsed = Number.parseFloat(value);
    const cap = !Number.isFinite(parsed) || parsed < 0 ? 0 : parsed / 100;

    const updated: SportEdgeCapConfig[] = sportTypes.map((sp) => {
      const existing =
        state.config?.sportEdgeCaps.find((s) => s.sport === sp) ?? null;
      if (sp === sport) {
        return { sport: sp, cap };
      }
      return existing ?? { sport: sp, cap: 0 };
    });

    updateConfigField("sportEdgeCaps", updated);
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

            <section className="space-y-5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Edge Caps
              </h2>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Casino Edge Caps (per category)
                </h3>
                <div className="space-y-2 rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
                  {casinoCategories.map((category) => {
                    const existing =
                      state.config?.casinoEdgeCaps.find(
                        (c) => c.category === category,
                      ) ?? null;
                    const percent = existing ? existing.cap * 100 : 0;
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-medium capitalize text-neutral-200">
                          {category}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={percent.toString()}
                            onChange={(e) =>
                              handleCasinoEdgeCapChange(
                                category,
                                e.target.value,
                              )
                            }
                            className="w-24 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-right text-xs outline-none focus:border-emerald-500"
                          />
                          <span className="text-xs text-neutral-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Sports Edge Caps (per sport)
                </h3>
                <div className="space-y-2 rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
                  {sportTypes.map((sport) => {
                    const existing =
                      state.config?.sportEdgeCaps.find(
                        (s) => s.sport === sport,
                      ) ?? null;
                    const percent = existing ? existing.cap * 100 : 0;
                    return (
                      <div
                        key={sport}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-medium capitalize text-neutral-200">
                          {sport}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={percent.toString()}
                            onChange={(e) =>
                              handleSportEdgeCapChange(sport, e.target.value)
                            }
                            className="w-24 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-right text-xs outline-none focus:border-emerald-500"
                          />
                          <span className="text-xs text-neutral-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}


