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
 * Calculate effective house edge for sports wager
 */
export function calculateSportsHouseEdge(
  sport: string,
  globalMargin: number,
  sportMarginFloors: Record<string, number>,
  sportMarginOverrides: Record<string, number>
): number {
  const sportFloor = sportMarginFloors[sport] || 0;
  const sportOverride = sportMarginOverrides[sport];
  const global = globalMargin || 0.08; // Default 0.08

  if (sportOverride !== undefined) {
    return sportOverride;
  }

  return Math.max(global, sportFloor);
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
  let weightedHE = 0;
  let totalWeightedHE = 0;

  // Process each wager
  for (const wager of eligibleWagers) {
    totalWager += wager.amount;

    let effectiveHE = 0;

    if (wager.productType === ProductType.CASINO) {
      casinoWager += wager.amount;
      if (!wager.rtp || !wager.casinoCategory) {
        continue; // Skip invalid casino wagers
      }
      effectiveHE = calculateCasinoHouseEdge(
        wager.rtp,
        wager.casinoCategory,
        config.casinoRtpFloors
      );
    } else if (wager.productType === ProductType.SPORTS) {
      sportsWager += wager.amount;
      if (!wager.sport) {
        continue; // Skip invalid sports wagers
      }
      effectiveHE = calculateSportsHouseEdge(
        wager.sport,
        config.globalMargin,
        config.sportMarginFloors,
        config.sportMarginOverrides
      );
    }

    // Weighted calculation: wager × effectiveHE
    weightedHE += wager.amount * effectiveHE;
    totalWeightedHE += wager.amount;
  }

  // Calculate average effective HE
  const avgEffectiveHE = totalWeightedHE > 0 ? weightedHE / totalWeightedHE : 0;

  // Calculate rakeback: Wager × House Edge × RBP × Override
  const rakebackAmount =
    totalWager *
    avgEffectiveHE *
    (config.rakebackPercentage / 100) *
    (config.overridePercentage / 100);

  // Round to 2 decimals
  const accruedRakeback = Math.round(rakebackAmount * 100) / 100;

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

