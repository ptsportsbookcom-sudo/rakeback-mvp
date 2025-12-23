import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";
import type { RakebackBreakdown } from "@/lib/types";

type RakebackSummary = {
  totalWagered: number;
  totalClaimed: number;
  claimableRakeback: number;
  pendingRakeback: number;
  casinoRakebackTotal: number;
  sportsRakebackTotal: number;
  wagersCount: number;
  claimsCount: number;
};

type StatusResponse = {
  summary: RakebackSummary;
};

type ErrorResponse = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | ErrorResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const wagers = store.wagers;
  const claims = store.claims;

  const totalWagered = wagers.reduce((sum, w) => sum + w.wager, 0);

  const totalRakebackAccrued = wagers.reduce(
    (sum, w) => sum + (w.rakeback?.rakebackAmount ?? 0),
    0,
  );

  const totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);

  const claimableRakeback = Math.max(totalRakebackAccrued - totalClaimed, 0);

  // In this simple model, all unclaimed rakeback is both "pending" and "claimable".
  const pendingRakeback = claimableRakeback;

  const casinoRakebackTotal = wagers.reduce((sum, w) => {
    if (w.rakeback && w.rakeback.betType === "casino") {
      return sum + w.rakeback.rakebackAmount;
    }
    return sum;
  }, 0);

  const sportsRakebackTotal = wagers.reduce((sum, w) => {
    if (w.rakeback && w.rakeback.betType === "sports") {
      return sum + w.rakeback.rakebackAmount;
    }
    return sum;
  }, 0);

  const summary: RakebackSummary = {
    totalWagered,
    totalClaimed,
    claimableRakeback,
    pendingRakeback,
    casinoRakebackTotal,
    sportsRakebackTotal,
    wagersCount: wagers.length,
    claimsCount: claims.length,
  };

  return res.status(200).json({ summary });
}


