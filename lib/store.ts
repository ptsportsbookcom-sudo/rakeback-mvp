import { RakebackStore } from "./types";

const nowIso = (): string => new Date().toISOString();

export const store: RakebackStore = {
  config: {
    enabled: true,
    // 10% base rakeback as a simple default for testing.
    baseRakebackPercentage: 0.1,
    // Override multiplier multiplies base rakeback, default 1.0 (no change).
    overrideMultiplier: 1.0,
    casinoFloors: [
      { category: "slots", floor: 0.02 },
      { category: "table", floor: 0.015 },
      { category: "live", floor: 0.02 },
      { category: "other", floor: 0.01 },
    ],
    sportFloors: [
      { sport: "soccer", floor: 0.03 },
      { sport: "basketball", floor: 0.03 },
      { sport: "tennis", floor: 0.025 },
      { sport: "other", floor: 0.02 },
    ],
    updatedAt: nowIso(),
  },
  wagers: [],
  claims: [],
  auditLogs: [],
};


