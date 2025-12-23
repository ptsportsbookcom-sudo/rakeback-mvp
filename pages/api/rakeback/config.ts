import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";
import type {
  CasinoEdgeCapConfig,
  RakebackConfig,
  SportEdgeCapConfig,
} from "@/lib/types";
import { createAuditLogEntry } from "@/lib/rakeback";

type ConfigResponse = {
  config: RakebackConfig;
};

type ErrorResponse = {
  error: string;
};

type UpdateConfigBody = {
  enabled?: boolean;
  baseRakebackPercentage?: number;
  overrideMultiplier?: number;
  casinoEdgeCaps?: CasinoEdgeCapConfig[];
  sportEdgeCaps?: SportEdgeCapConfig[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse | ErrorResponse>,
) {
  if (req.method === "GET") {
    return res.status(200).json({ config: store.config });
  }

  if (req.method === "POST") {
    const body: UpdateConfigBody = req.body;

    try {
      const updatedAt = new Date().toISOString();

      if (body.enabled !== undefined) {
        store.config.enabled = body.enabled;
      }

      if (typeof body.baseRakebackPercentage === "number") {
        if (body.baseRakebackPercentage < 0) {
          return res
            .status(400)
            .json({ error: "baseRakebackPercentage must be non-negative" });
        }
        store.config.baseRakebackPercentage = body.baseRakebackPercentage;
      }

      if (typeof body.overrideMultiplier === "number") {
        if (body.overrideMultiplier < 0) {
          return res.status(400).json({ error: "overrideMultiplier must be non-negative" });
        }
        store.config.overrideMultiplier = body.overrideMultiplier;
      }

      if (Array.isArray(body.casinoEdgeCaps)) {
        // Ensure non-negative caps.
        store.config.casinoEdgeCaps = body.casinoEdgeCaps.map((entry) => ({
          ...entry,
          cap: entry.cap < 0 ? 0 : entry.cap,
        }));
      }

      if (Array.isArray(body.sportEdgeCaps)) {
        store.config.sportEdgeCaps = body.sportEdgeCaps.map((entry) => ({
          ...entry,
          cap: entry.cap < 0 ? 0 : entry.cap,
        }));
      }

      store.config.updatedAt = updatedAt;

      store.auditLogs.push(
        createAuditLogEntry({
          type: "config_update",
          details: {
            updatedAt,
            config: store.config,
          },
        }),
      );

      return res.status(200).json({ config: store.config });
    } catch (error) {
      // Basic error handling with minimal leakage.
      return res.status(500).json({ error: "Failed to update config" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}


