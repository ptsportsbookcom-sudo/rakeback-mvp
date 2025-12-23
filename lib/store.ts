import { RakebackStore } from "./types";

const nowIso = (): string => new Date().toISOString();

export const store: RakebackStore = {
  config: {
    enabled: true,
    // 10% base rakeback as a simple default for testing.
    baseRakebackPercentage: 0.1,
    overrideMultiplier: 1.0,
    // Default per-category and per-sport caps so that extremely high edges
    // do not overpay in tests.
    casinoEdgeCaps: [
      { category: "slots", cap: 0.1 },
      { category: "table", cap: 0.08 },
      { category: "live", cap: 0.1 },
      { category: "other", cap: 0.05 },
    ],
    sportEdgeCaps: [
      { sport: "soccer", cap: 0.08 },
      { sport: "basketball", cap: 0.08 },
      { sport: "tennis", cap: 0.07 },
      { sport: "other", cap: 0.06 },
    ],
    updatedAt: nowIso(),
  },
  wagers: [],
  claims: [],
  auditLogs: [],
};


