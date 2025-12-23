import { RakebackStore } from "./types";

const nowIso = (): string => new Date().toISOString();

export const store: RakebackStore = {
  config: {
    enabled: true,
    // 10% base rakeback as a simple default for testing.
    baseRakebackPercentage: 0.1,
    // Override multiplier multiplies base rakeback, default 1.0 (no change).
    overrideMultiplier: 1.0,
    // Default caps so that extremely high edges do not overpay in tests.
    casinoEdgeCap: 0.1,
    sportsEdgeCap: 0.08,
    updatedAt: nowIso(),
  },
  wagers: [],
  claims: [],
  auditLogs: [],
};


