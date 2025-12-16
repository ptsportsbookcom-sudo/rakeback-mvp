// Rakeback Types

export type StakeSourceType = 'REAL_CASH' | 'CLEARED_CASH' | 'BONUS' | 'FREE_BET' | 'PROMO_BALANCE';
export type ProductType = 'CASINO' | 'SPORTS';
export type CasinoCategory = 'SLOTS' | 'LIVE' | 'TABLE' | 'CRASH' | 'OTHER';
export type SportType = 'FOOTBALL' | 'TENNIS' | 'BASKETBALL' | 'ESPORTS' | 'OTHER';
export type BetStatus = 'SETTLED' | 'UNSETTLED' | 'VOID';

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
  sportMarginOverrides: Record<SportType, number>; // Per-sport margin overrides
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

