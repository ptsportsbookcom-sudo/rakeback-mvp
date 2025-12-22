// Rakeback calculation logic

import type { Wager, RakebackConfig, PlayerRakeback } from './types';
import { StakeSourceType, ProductType, BetStatus } from './types';

/**
 * Calculate effective house edge for casino wager
 */
export function calculateCasinoHouseEdge(
  rtp: number,
  category: string,
  rtpFloors: Record<string, number>
): number {
  const rtpFloor = rtpFloors[category] || 0.90; // Default 0.90 for slots
  const realHE = 1 - rtp;
  const floorHE = 1 - rtpFloor;
  return Math.max(realHE, floorHE);
}

/**
 * Calculate effective margin for sports wager
 * Formula: max(Reported Market Margin, Sport Margin Floor)
 */
export function calculateSportsEffectiveMargin(
  reportedMargin: number,
  sport: string,
  sportMarginFloors: Record<string, number>
): number {
  const sportFloor = sportMarginFloors[sport] || 0;
  // Effective Margin = max(Reported Market Margin, Sport Margin Floor)
  return Math.max(reportedMargin, sportFloor);
}

/**
 * Check if wager is eligible (real money only)
 */
export function isEligibleWager(wager: Wager): boolean {
  return (
    wager.stakeSourceType === StakeSourceType.REAL_CASH ||
    wager.stakeSourceType === StakeSourceType.CLEARED_CASH
  );
}

/**
 * Calculate rakeback for a player based on their wagers
 * Formula: Rakeback = Wager × Effective Edge × Base Rakeback % × Override %
 * Applied per wager and summed
 */
export function calculatePlayerRakeback(
  wagers: Wager[],
  config: RakebackConfig
): PlayerRakeback {
  // Filter eligible wagers
  const eligibleWagers = wagers.filter(w => {
    if (!isEligibleWager(w)) return false;
    
    // Skip unsettled or void sports bets
    if (w.productType === ProductType.SPORTS && w.betStatus !== BetStatus.SETTLED) {
      return false;
    }
    
    return true;
  });

  let totalWager = 0;
  let casinoWager = 0;
  let sportsWager = 0;
  let totalRakeback = 0;
  let weightedHE = 0;
  let totalWeightedHE = 0;

  // Process each wager
  for (const wager of eligibleWagers) {
    totalWager += wager.amount;

    let effectiveEdge = 0;

    if (wager.productType === ProductType.CASINO) {
      casinoWager += wager.amount;
      if (!wager.rtp || !wager.casinoCategory) {
        continue; // Skip invalid casino wagers
      }
      // Effective Edge = max(1 - RTP, Casino HE Floor)
      effectiveEdge = calculateCasinoHouseEdge(
        wager.rtp,
        wager.casinoCategory,
        config.casinoRtpFloors
      );
    } else if (wager.productType === ProductType.SPORTS) {
      sportsWager += wager.amount;
      if (!wager.sport || wager.margin === undefined) {
        continue; // Skip invalid sports wagers
      }
      // Effective Margin = max(Reported Market Margin, Sport Margin Floor)
      effectiveEdge = calculateSportsEffectiveMargin(
        wager.margin,
        wager.sport,
        config.sportMarginFloors
      );
    }

    // Calculate rakeback per wager: Wager × Effective Edge × Base % × Override %
    const baseRakebackPct = config.rakebackPercentage / 100; // Convert % to decimal
    const overrideMultiplier = config.overridePercentage / 100; // Convert % to decimal
    const wagerRakeback = wager.amount * effectiveEdge * baseRakebackPct * overrideMultiplier;
    totalRakeback += wagerRakeback;

    // Track weighted HE for average calculation (for display purposes)
    weightedHE += wager.amount * effectiveEdge;
    totalWeightedHE += wager.amount;
  }

  // Calculate average effective HE (for display purposes)
  const avgEffectiveHE = totalWeightedHE > 0 ? weightedHE / totalWeightedHE : 0;

  // Round to 2 decimals
  const accruedRakeback = Math.round(totalRakeback * 100) / 100;

  // Get playerId from wagers (should all be same player)
  const playerId = eligibleWagers.length > 0 ? eligibleWagers[0].playerId : '';

  return {
    playerId,
    totalWager,
    casinoWager,
    sportsWager,
    effectiveHouseEdge: avgEffectiveHE,
    accruedRakeback,
    claimedRakeback: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Recalculate rakeback for a player (forward-only, from config timestamp)
 */
export function recalculatePlayerRakeback(
  playerId: string,
  allWagers: Wager[],
  config: RakebackConfig
): PlayerRakeback {
  // Get player wagers after config was last updated
  const configTimestamp = new Date(config.lastUpdated).getTime();
  const playerWagers = allWagers.filter(
    w => w.playerId === playerId && new Date(w.timestamp).getTime() >= configTimestamp
  );

  return calculatePlayerRakeback(playerWagers, config);
}

