import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }

    const rakeback = storage.getPlayerRakeback(playerId);

    if (!rakeback) {
      return res.status(404).json({ error: 'No rakeback found for player' });
    }

    if (rakeback.accruedRakeback <= 0) {
      return res.status(400).json({ error: 'No rakeback to claim' });
    }

    // Claim rakeback (reset accrued, add to claimed)
    const claimAmount = rakeback.accruedRakeback;
    rakeback.claimedRakeback += claimAmount;
    rakeback.accruedRakeback = 0;
    rakeback.lastClaimedAt = new Date().toISOString();
    rakeback.lastUpdated = new Date().toISOString();

    storage.savePlayerRakeback(playerId, rakeback);

    // Add audit log
    storage.addAuditLog({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action: 'CLAIM_RAKEBACK',
      field: 'rakeback',
      oldValue: null,
      newValue: JSON.stringify({ playerId, claimAmount }),
      timestamp: new Date().toISOString(),
      actor: playerId,
    });

    return res.status(200).json({
      success: true,
      claimedAmount: claimAmount,
      rakeback: {
        accruedRakeback: rakeback.accruedRakeback,
        claimedRakeback: rakeback.claimedRakeback,
        lastClaimedAt: rakeback.lastClaimedAt,
      },
    });
  } catch (error: any) {
    console.error('Error claiming rakeback:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

