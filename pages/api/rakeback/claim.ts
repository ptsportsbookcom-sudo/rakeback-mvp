import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";
import type { Claim, Wager } from "@/lib/types";
import { createAuditLogEntry } from "@/lib/rakeback";

type ClaimResponse = {
  claim: Claim;
};

type ErrorResponse = {
  error: string;
};

const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const unclaimedByWager = store.wagers.map((w) => {
    const totalForWager = w.rakeback?.rakebackAmount ?? 0;
    const unclaimed = Math.max(totalForWager - w.claimedRakebackAmount, 0);
    return { wager: w, unclaimed };
  });

  const totalClaimable = unclaimedByWager.reduce((sum, entry) => sum + entry.unclaimed, 0);

  if (totalClaimable <= 0) {
    return res.status(400).json({ error: "No claimable rakeback available" });
  }

  const createdAt = new Date().toISOString();

  // Mark all unclaimed rakeback as claimed per wager.
  const claimedWagerIds: string[] = [];

  unclaimedByWager.forEach(({ wager, unclaimed }) => {
    if (unclaimed > 0) {
      wager.claimedRakebackAmount += unclaimed;
      claimedWagerIds.push(wager.id);
    }
  });

  const claim: Claim = {
    id: generateId(),
    amount: totalClaimable,
    createdAt,
    wagerIds: claimedWagerIds,
  };

  store.claims.push(claim);
  store.auditLogs.push(
    createAuditLogEntry({
      type: "claim",
      details: claim,
    }),
  );

  return res.status(201).json({ claim });
}


