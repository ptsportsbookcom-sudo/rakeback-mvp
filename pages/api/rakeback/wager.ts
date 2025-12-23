import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";
import type {
  BetType,
  CasinoCategory,
  RakebackBreakdown,
  SportType,
  Wager,
} from "@/lib/types";
import { createAuditLogEntry, createWagerWithRakeback } from "@/lib/rakeback";

type WagerRequestBody = {
  betType: BetType;
  wager: number;
  // Casino
  rtp?: number;
  category?: CasinoCategory;
  // Sports
  marketMargin?: number;
  sport?: SportType;
};

type WagerResponse = {
  wager: Wager;
};

type ErrorResponse = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<WagerResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!store.config.enabled) {
    return res.status(400).json({ error: "Rakeback is currently disabled" });
  }

  const body: WagerRequestBody = req.body;

  const { betType, wager } = body;

  if (betType !== "casino" && betType !== "sports") {
    return res.status(400).json({ error: "betType must be 'casino' or 'sports'" });
  }

  if (typeof wager !== "number" || !Number.isFinite(wager) || wager <= 0) {
    return res.status(400).json({ error: "wager must be a positive number" });
  }

  try {
    let createdWager: Wager;

    if (betType === "casino") {
      const { rtp, category } = body;

      if (typeof rtp !== "number" || rtp <= 0 || rtp >= 1) {
        return res
          .status(400)
          .json({ error: "rtp must be a number between 0 and 1 (exclusive)" });
      }

      if (!category) {
        return res.status(400).json({ error: "category is required for casino bets" });
      }

      createdWager = createWagerWithRakeback({
        betType,
        wager,
        rtp,
        category,
        config: store.config,
      });
    } else {
      const { marketMargin, sport } = body;

      if (
        typeof marketMargin !== "number" ||
        marketMargin <= 0 ||
        !Number.isFinite(marketMargin)
      ) {
        return res.status(400).json({
          error: "marketMargin must be a positive number (e.g. 0.05 for 5%)",
        });
      }

      if (!sport) {
        return res.status(400).json({ error: "sport is required for sports bets" });
      }

      createdWager = createWagerWithRakeback({
        betType,
        wager,
        marketMargin,
        sport,
        config: store.config,
      });
    }

    store.wagers.push(createdWager);
    store.auditLogs.push(
      createAuditLogEntry({
        type: "wager",
        details: createdWager as Wager & { rakeback: RakebackBreakdown },
      }),
    );

    return res.status(201).json({ wager: createdWager });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create wager" });
  }
}


