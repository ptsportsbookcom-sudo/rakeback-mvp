export type BetType = "casino" | "sports";

export type CasinoCategory = "slots" | "table" | "live" | "other";

export type SportType = "soccer" | "basketball" | "tennis" | "other";

export interface CasinoEdgeCapConfig {
  category: CasinoCategory;
  /**
   * Maximum house edge (margin) for this casino category, expressed as a decimal.
   * Example: 0.10 for 10%.
   */
  cap: number;
}

export interface SportEdgeCapConfig {
  sport: SportType;
  /**
   * Maximum market margin for this sport, expressed as a decimal.
   * Example: 0.08 for 8%.
   */
  cap: number;
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
  /**
   * Per-category maximum casino edge (1 - RTP) used for rakeback.
   */
  casinoEdgeCaps: CasinoEdgeCapConfig[];
  /**
   * Per-sport maximum sportsbook margin used for rakeback.
   */
  sportEdgeCaps: SportEdgeCapConfig[];
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
  /**
   * Actual casino house edge before cap (1 - RTP).
   */
  actualEdge?: number;
  /**
   * Configured maximum casino edge used for rakeback.
   */
  casinoEdgeCap?: number;
  category?: CasinoCategory;
  // Sports-only
  marketMargin?: number;
  /**
   * Configured maximum sportsbook margin used for rakeback.
   */
  sportsEdgeCap?: number;
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


