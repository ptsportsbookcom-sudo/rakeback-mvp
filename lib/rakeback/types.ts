// Rakeback Types

export enum StakeSourceType {
  REAL_CASH = 'REAL_CASH',
  CLEARED_CASH = 'CLEARED_CASH',
  BONUS = 'BONUS',
  FREE_BET = 'FREE_BET',
  PROMO_BALANCE = 'PROMO_BALANCE',
}

export enum ProductType {
  CASINO = 'CASINO',
  SPORTS = 'SPORTS',
}

export enum CasinoCategory {
  SLOTS = 'SLOTS',
  LIVE = 'LIVE',
  TABLE = 'TABLE',
  CRASH = 'CRASH',
  OTHER = 'OTHER',
}

export enum SportType {
  FOOTBALL = 'FOOTBALL',
  TENNIS = 'TENNIS',
  BASKETBALL = 'BASKETBALL',
  ESPORTS = 'ESPORTS',
  OTHER = 'OTHER',
}

export enum BetStatus {
  SETTLED = 'SETTLED',
  UNSETTLED = 'UNSETTLED',
  VOID = 'VOID',
}

export interface Wager {
  id: string;
  playerId: string;
  amount: number;
  stakeSourceType: StakeSourceType;
  productType: ProductType;
  timestamp: string;
  // Casino-specific
  casinoCategory?: CasinoCategory;
  rtp?: number; // RTP value (decimal, e.g., 0.95 = 95%)
  // Sports-specific
  sport?: SportType;
  margin?: number; // Reported market margin (decimal, e.g., 0.08 = 8%)
  betStatus?: BetStatus;
}

export interface RakebackConfig {
  enabled: boolean;
  rakebackPercentage: number; // RBP (e.g., 10 = 10%)
  overridePercentage: number; // Override % (e.g., 100 = 100%)
  // Casino RTP floors per category
  casinoRtpFloors: Record<CasinoCategory, number>; // e.g., { SLOTS: 0.90 }
  // Sportsbook margins
  globalMargin: number; // Global default margin (e.g., 0.08 = 8%)
  sportMarginFloors: Record<SportType, number>; // Per-sport margin floors
  sportMarginOverrides: Partial<Record<SportType, number>>; // Per-sport margin overrides
  lastUpdated: string;
  lastUpdatedBy?: string;
}

export interface PlayerRakeback {
  playerId: string;
  totalWager: number;
  casinoWager: number;
  sportsWager: number;
  effectiveHouseEdge: number; // Weighted average
  accruedRakeback: number;
  claimedRakeback: number;
  lastClaimedAt?: string;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  action: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
  actor?: string;
}

export interface RakebackReport {
  totalPlayers: number;
  totalWager: number;
  totalCasinoWager: number;
  totalSportsWager: number;
  totalAccruedRakeback: number;
  totalClaimedRakeback: number;
  players: Array<{
    playerId: string;
    totalWager: number;
    accruedRakeback: number;
    claimedRakeback: number;
  }>;
}

