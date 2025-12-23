import {
  AuditLogEntry,
  BetType,
  CasinoCategory,
  CasinoFloorConfig,
  RakebackBreakdown,
  RakebackConfig,
  SportFloorConfig,
  SportType,
  Wager,
} from "./types";

const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const findCasinoFloor = (
  category: CasinoCategory,
  casinoFloors: CasinoFloorConfig[],
): number => {
  const match = casinoFloors.find((c) => c.category === category);
  return match ? match.floor : 0;
};

const findSportFloor = (sport: SportType, sportFloors: SportFloorConfig[]): number => {
  const match = sportFloors.find((s) => s.sport === sport);
  return match ? match.floor : 0;
};

export const getCasinoEffectiveEdge = (
  rtp: number,
  category: CasinoCategory,
  config: RakebackConfig,
): number => {
  const houseEdge = 1 - rtp;
  const floor = findCasinoFloor(category, config.casinoFloors);
  return Math.max(houseEdge, floor);
};

export const getSportsEffectiveEdge = (
  marketMargin: number,
  sport: SportType,
  config: RakebackConfig,
): number => {
  const floor = findSportFloor(sport, config.sportFloors);
  return Math.max(marketMargin, floor);
};

export const calculateRakebackAmount = (
  wager: number,
  effectiveEdge: number,
  baseRakebackPercentage: number,
  overrideMultiplier: number,
): number => {
  // Rakeback = Wager × EffectiveEdge × BaseRB% × OverrideMultiplier
  return wager * effectiveEdge * baseRakebackPercentage * overrideMultiplier;
};

export const calculateCasinoRakeback = (params: {
  wager: number;
  rtp: number;
  category: CasinoCategory;
  config: RakebackConfig;
}): RakebackBreakdown => {
  const { wager, rtp, category, config } = params;
  const effectiveEdge = getCasinoEffectiveEdge(rtp, category, config);
  const amount = calculateRakebackAmount(
    wager,
    effectiveEdge,
    config.baseRakebackPercentage,
    config.overrideMultiplier,
  );

  return {
    betType: "casino",
    wager,
    effectiveEdge,
    baseRakebackPercentage: config.baseRakebackPercentage,
    overrideMultiplier: config.overrideMultiplier,
    rakebackAmount: amount,
    rtp,
    category,
  };
};

export const calculateSportsRakeback = (params: {
  wager: number;
  marketMargin: number;
  sport: SportType;
  config: RakebackConfig;
}): RakebackBreakdown => {
  const { wager, marketMargin, sport, config } = params;
  const effectiveEdge = getSportsEffectiveEdge(marketMargin, sport, config);
  const amount = calculateRakebackAmount(
    wager,
    effectiveEdge,
    config.baseRakebackPercentage,
    config.overrideMultiplier,
  );

  return {
    betType: "sports",
    wager,
    effectiveEdge,
    baseRakebackPercentage: config.baseRakebackPercentage,
    overrideMultiplier: config.overrideMultiplier,
    rakebackAmount: amount,
    marketMargin,
    sport,
  };
};

export const createWagerWithRakeback = (params: {
  betType: BetType;
  wager: number;
  rtp?: number;
  marketMargin?: number;
  category?: CasinoCategory;
  sport?: SportType;
  config: RakebackConfig;
}): Wager => {
  const { betType, wager, rtp, marketMargin, category, sport, config } = params;
  const createdAt = new Date().toISOString();

  let rakeback: RakebackBreakdown;

  if (betType === "casino") {
    if (rtp === undefined || category === undefined) {
      throw new Error("Casino wager requires rtp and category");
    }
    rakeback = calculateCasinoRakeback({ wager, rtp, category, config });
  } else {
    if (marketMargin === undefined || sport === undefined) {
      throw new Error("Sports wager requires marketMargin and sport");
    }
    rakeback = calculateSportsRakeback({ wager, marketMargin, sport, config });
  }

  return {
    id: generateId(),
    betType,
    wager,
    createdAt,
    claimedRakebackAmount: 0,
    rtp,
    category,
    marketMargin,
    sport,
    rakeback,
  };
};

export const createAuditLogEntry = (details: {
  type: AuditLogEntry["type"];
  details: unknown;
}): AuditLogEntry => {
  return {
    id: generateId(),
    type: details.type,
    createdAt: new Date().toISOString(),
    details: details.details,
  };
};


