import { useEffect, useMemo, useState } from "react";
import { calculateRakebackAmount } from "@/lib/rakeback";
import type {
  BetType,
  CasinoCategory,
  RakebackConfig,
  SportType,
} from "@/lib/types";

const casinoCategories: CasinoCategory[] = ["slots", "table", "live", "other"];
const sportTypes: SportType[] = ["soccer", "basketball", "tennis", "other"];

type Mode = BetType;

interface SimulatorState {
  config: RakebackConfig | null;
  loadingConfig: boolean;
  error: string | null;
  placing: boolean;
}

export default function SimulatorPage() {
  const [state, setState] = useState<SimulatorState>({
    config: null,
    loadingConfig: true,
    error: null,
    placing: false,
  });

  const [mode, setMode] = useState<Mode>("casino");
  const [wagerAmount, setWagerAmount] = useState<string>("100");
  const [casinoCategory, setCasinoCategory] =
    useState<CasinoCategory>("slots");
  const [rtpPercentage, setRtpPercentage] = useState<string>("95");
  const [sport, setSport] = useState<SportType>("soccer");
  const [marginPercentage, setMarginPercentage] = useState<string>("5");
  const [lastPlacedMessage, setLastPlacedMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadConfig = async () => {
      setState((prev) => ({ ...prev, loadingConfig: true, error: null }));
      try {
        const res = await fetch("/api/rakeback/config");
        if (!res.ok) {
          throw new Error("Failed to load config");
        }
        const data = (await res.json()) as { config: RakebackConfig };
        setState({
          config: data.config,
          loadingConfig: false,
          error: null,
          placing: false,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loadingConfig: false,
          error: "Unable to load config",
        }));
      }
    };

    void loadConfig();
  }, []);

  const numericWager = useMemo(() => {
    const parsed = Number.parseFloat(wagerAmount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [wagerAmount]);

  const numericRtp = useMemo(() => {
    const parsed = Number.parseFloat(rtpPercentage);
    return Number.isFinite(parsed) && parsed > 0 && parsed < 100
      ? parsed / 100
      : 0;
  }, [rtpPercentage]);

  const numericMargin = useMemo(() => {
    const parsed = Number.parseFloat(marginPercentage);
    return Number.isFinite(parsed) && parsed > 0 ? parsed / 100 : 0;
  }, [marginPercentage]);

  const preview = useMemo(() => {
    if (!state.config || numericWager <= 0) {
      return null;
    }

    const { baseRakebackPercentage, overrideMultiplier } = state.config;

    if (mode === "casino") {
      if (numericRtp <= 0 || numericRtp >= 1) {
        return null;
      }
      const actualEdge = 1 - numericRtp;
      const categoryCapEntry =
        state.config.casinoEdgeCaps.find(
          (c) => c.category === casinoCategory,
        ) ?? null;
      const cap = categoryCapEntry ? categoryCapEntry.cap : 0;
      const effectiveEdge = Math.min(actualEdge, cap);
      const rakeback = calculateRakebackAmount(
        numericWager,
        effectiveEdge,
        baseRakebackPercentage,
        overrideMultiplier,
      );
      return {
        betType: "casino" as const,
        actualEdge,
        cap,
        effectiveEdge,
        rakeback,
      };
    }

    if (numericMargin <= 0) {
      return null;
    }

    const actualMargin = numericMargin;
    const sportCapEntry =
      state.config.sportEdgeCaps.find((c) => c.sport === sport) ?? null;
    const cap = sportCapEntry ? sportCapEntry.cap : 0;
    const effectiveEdge = Math.min(actualMargin, cap);
    const rakeback = calculateRakebackAmount(
      numericWager,
      effectiveEdge,
      baseRakebackPercentage,
      overrideMultiplier,
    );
    return {
      betType: "sports" as const,
      actualMargin,
      cap,
      effectiveEdge,
      rakeback,
    };
  }, [state.config, numericWager, numericRtp, numericMargin, mode]);

  const handlePlaceBet = async () => {
    if (!state.config) return;
    if (!preview) return;

    setState((prev) => ({ ...prev, placing: true, error: null }));
    setLastPlacedMessage(null);

    try {
      const payload =
        mode === "casino"
          ? {
              betType: "casino" as const,
              wager: numericWager,
              rtp: numericRtp,
              category: casinoCategory,
            }
          : {
              betType: "sports" as const,
              wager: numericWager,
              marketMargin: numericMargin,
              sport,
            };

      const res = await fetch("/api/rakeback/wager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to place bet");
      }

      setLastPlacedMessage(
        `Bet placed: ${mode === "casino" ? "Casino" : "Sports"} · Wager ${numericWager.toFixed(2)} · Rakeback ${preview.rakeback.toFixed(4)}`,
      );
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to place bet",
      }));
    } finally {
      setState((prev) => ({ ...prev, placing: false }));
    }
  };

  const basePercentDisplay =
    state.config?.baseRakebackPercentage !== undefined
      ? (state.config.baseRakebackPercentage * 100).toFixed(2)
      : "";

  const overrideMultiplierDisplay =
    state.config?.overrideMultiplier !== undefined
      ? state.config.overrideMultiplier.toFixed(2)
      : "";

  const effectiveEdgePercent =
    preview !== null ? (preview.effectiveEdge * 100).toFixed(3) : null;

  const rakebackDisplay =
    preview !== null ? preview.rakeback.toFixed(4) : undefined;

  const casinoActualEdgePercent =
    preview !== null && preview.betType === "casino"
      ? (preview.actualEdge * 100).toFixed(3)
      : null;

  const sportsActualMarginPercent =
    preview !== null && preview.betType === "sports"
      ? (preview.actualMargin * 100).toFixed(3)
      : null;

  const capPercent =
    preview !== null ? (preview.cap * 100).toFixed(3) : undefined;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Rakeback Simulator
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Test casino and sportsbook rakeback with live math breakdown.
            </p>
          </div>
          <nav className="flex gap-3 text-sm">
            <a
              href="/admin"
              className="rounded-full bg-neutral-900 px-3 py-1 text-neutral-300 hover:bg-neutral-800"
            >
              Config
            </a>
            <a
              href="/admin/simulator"
              className="rounded-full bg-neutral-800 px-3 py-1 font-medium text-neutral-100"
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

        {state.loadingConfig && (
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
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  Bet Parameters
                </h2>
                <div className="flex gap-1 rounded-full bg-neutral-900 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("casino")}
                    className={`rounded-full px-3 py-1 font-medium ${
                      mode === "casino"
                        ? "bg-emerald-500 text-emerald-950"
                        : "text-neutral-300"
                    }`}
                  >
                    Casino
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("sports")}
                    className={`rounded-full px-3 py-1 font-medium ${
                      mode === "sports"
                        ? "bg-emerald-500 text-emerald-950"
                        : "text-neutral-300"
                    }`}
                  >
                    Sports
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Wager Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(e.target.value)}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                {mode === "casino" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Category
                      </label>
                      <select
                        value={casinoCategory}
                        onChange={(e) =>
                          setCasinoCategory(e.target.value as CasinoCategory)
                        }
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      >
                        {casinoCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        RTP (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={rtpPercentage}
                        onChange={(e) => setRtpPercentage(e.target.value)}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Sport
                      </label>
                      <select
                        value={sport}
                        onChange={(e) =>
                          setSport(e.target.value as SportType)
                        }
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      >
                        {sportTypes.map((sp) => (
                          <option key={sp} value={sp}>
                            {sp}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Market Margin (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={marginPercentage}
                        onChange={(e) => setMarginPercentage(e.target.value)}
                        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePlaceBet}
                disabled={state.placing || !preview || numericWager <= 0}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
              >
                {state.placing ? "Placing…" : "Place Bet"}
              </button>

              {lastPlacedMessage && (
                <p className="mt-2 text-xs text-emerald-300">
                  {lastPlacedMessage}
                </p>
              )}
            </section>

            <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Live Rakeback Preview
              </h2>

              {!preview && (
                <p className="text-sm text-neutral-400">
                  Enter a valid wager and parameters to see rakeback.
                </p>
              )}

              {preview && state.config && (
                <div className="space-y-4">
                  <div className="rounded-md border border-neutral-800 bg-neutral-950/60 p-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Estimated Rakeback
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          {rakebackDisplay}
                        </p>
                      </div>
                      <div className="text-right text-xs text-neutral-400">
                        <p>
                          Base:{" "}
                          <span className="font-mono">
                            {basePercentDisplay}%
                          </span>
                        </p>
                        <p>
                          Override:{" "}
                          <span className="font-mono">
                            × {overrideMultiplierDisplay}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-neutral-500">
                      Rakeback = Wager × EffectiveEdge × Base% × Override
                    </p>
                  </div>

                  <div className="grid gap-3 text-xs">
                    <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                      <span className="text-neutral-400">Wager</span>
                      <span className="font-mono">
                        {numericWager.toFixed(2)}
                      </span>
                    </div>
                    {preview.betType === "casino" && (
                      <>
                        <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                          <span className="text-neutral-400">
                            Actual Edge (1 − RTP)
                          </span>
                          <span className="font-mono">
                            {casinoActualEdgePercent}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-amber-500/60 bg-amber-950/20 px-3 py-2">
                          <span className="text-neutral-200">
                            Casino Edge Cap
                          </span>
                          <span className="font-mono">{capPercent}%</span>
                        </div>
                      </>
                    )}
                    {preview.betType === "sports" && (
                      <>
                        <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                          <span className="text-neutral-400">
                            Actual Market Margin
                          </span>
                          <span className="font-mono">
                            {sportsActualMarginPercent}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-amber-500/60 bg-amber-950/20 px-3 py-2">
                          <span className="text-neutral-200">
                            Sportsbook Edge Cap
                          </span>
                          <span className="font-mono">{capPercent}%</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                      <span className="text-neutral-400">Effective Edge</span>
                      <span className="font-mono">
                        {effectiveEdgePercent}%{" "}
                        {preview.cap !== undefined &&
                          ((preview.betType === "casino" &&
                            preview.actualEdge > preview.cap) ||
                            (preview.betType === "sports" &&
                              preview.actualMargin > preview.cap)) && (
                            <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                              Cap Applied
                            </span>
                          )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                      <span className="text-neutral-400">Base Rakeback %</span>
                      <span className="font-mono">{basePercentDisplay}%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2">
                      <span className="text-neutral-400">
                        Override Multiplier
                      </span>
                      <span className="font-mono">
                        × {overrideMultiplierDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-md border border-neutral-900 bg-neutral-950/40 p-3 text-xs text-neutral-500">
                <p className="font-semibold text-neutral-400">
                  Casino Formula
                </p>
                <p className="mt-1">
                  ActualEdge = 1 − RTP
                </p>
                <p>
                  EffectiveEdge = min(ActualEdge, CasinoEdgeCap)
                </p>
                <p>
                  Rakeback = Wager × EffectiveEdge × BaseRakeback% ×
                  OverrideMultiplier
                </p>
                <p className="mt-2 font-semibold text-neutral-400">
                  Sportsbook Formula
                </p>
                <p className="mt-1">
                  ActualEdge = MarketMargin
                </p>
                <p>
                  EffectiveEdge = min(MarketMargin, SportsEdgeCap)
                </p>
                <p>
                  Rakeback = Wager × EffectiveEdge × BaseRakeback% ×
                  OverrideMultiplier
                </p>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}


