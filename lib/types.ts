export type BetType = "casino" | "sports";

export type CasinoCategory = "slots" | "table" | "live" | "other";

export type SportType = "soccer" | "basketball" | "tennis" | "other";

export interface CasinoFloorConfig {
  category: CasinoCategory;
  /**
   * Minimum house edge (margin) for this casino category, expressed as a decimal.
   * Example: 0.02 for 2%.
   */
  floor: number;
}

export interface SportFloorConfig {
  sport: SportType;
  /**
   * Minimum market margin for this sport, expressed as a decimal.
   * Example: 0.03 for 3%.
   */
  floor: number;
}

export interface RakebackConfig {
  enabled: boolean;
  /**
   * Base rakeback percentage expressed as a decimal.
   * Example: 0.10 for 10%.
   */
  baseRakebackPercentage: number;
  /**
   * Override multiplier that ALWAYS multiplies the base rakeback.
   * Default is 1.0 (no change).
   */
  overrideMultiplier: number;
  casinoFloors: CasinoFloorConfig[];
  sportFloors: SportFloorConfig[];
  updatedAt: string;
}

export interface RakebackBreakdown {
  betType: BetType;
  wager: number;
  effectiveEdge: number;
  baseRakebackPercentage: number;
  overrideMultiplier: number;
  rakebackAmount: number;
  // Casino-only
  rtp?: number;
  category?: CasinoCategory;
  // Sports-only
  marketMargin?: number;
  sport?: SportType;
}

export interface Wager {
  id: string;
  betType: BetType;
  wager: number;
  createdAt: string;
  /**
   * Portion of this wager's rakeback that has already been claimed.
   * This allows manual claims without any retroactive recalculation.
   */
  claimedRakebackAmount: number;
  // Casino
  rtp?: number;
  category?: CasinoCategory;
  // Sports
  marketMargin?: number;
  sport?: SportType;
  rakeback: RakebackBreakdown;
}

export interface Claim {
  id: string;
  amount: number;
  createdAt: string;
  /**
   * IDs of wagers whose rakeback contributed to this claim.
   * This is for auditability only; we do not recalc retroactively.
   */
  wagerIds: string[];
}

export type AuditLogType = "config_update" | "wager" | "claim";

export interface AuditLogEntry {
  id: string;
  type: AuditLogType;
  createdAt: string;
  details: unknown;
}

export interface RakebackStore {
  config: RakebackConfig;
  wagers: Wager[];
  claims: Claim[];
  auditLogs: AuditLogEntry[];
}


