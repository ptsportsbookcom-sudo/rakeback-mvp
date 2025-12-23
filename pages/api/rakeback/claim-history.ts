import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "@/lib/store";
import type { Claim } from "@/lib/types";

type ClaimHistoryResponse = {
  claims: Claim[];
};

type ErrorResponse = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimHistoryResponse | ErrorResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const claims: Claim[] = [...store.claims].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  );

  return res.status(200).json({ claims });
}


