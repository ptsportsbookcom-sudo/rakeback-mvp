import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';
import { recalculatePlayerRakeback } from '../../../lib/rakeback/calculator';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerId } = req.query;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'playerId is required' });
  }

  try {
    const config = storage.getConfig();
    const wagers = storage.getWagers();
    
    // Recalculate rakeback (forward-only from config timestamp)
    const rakeback = recalculatePlayerRakeback(playerId, wagers, config);
    
    // Merge with existing claimed amount
    const existing = storage.getPlayerRakeback(playerId);
    if (existing) {
      rakeback.claimedRakeback = existing.claimedRakeback;
      rakeback.lastClaimedAt = existing.lastClaimedAt;
    }
    
    // Save updated rakeback
    storage.savePlayerRakeback(playerId, rakeback);

    return res.status(200).json({
      config: {
        enabled: config.enabled,
        rakebackPercentage: config.rakebackPercentage,
        overridePercentage: config.overridePercentage,
      },
      rakeback: {
        totalWager: rakeback.totalWager,
        casinoWager: rakeback.casinoWager,
        sportsWager: rakeback.sportsWager,
        effectiveHouseEdge: rakeback.effectiveHouseEdge,
        accruedRakeback: rakeback.accruedRakeback,
        claimedRakeback: rakeback.claimedRakeback,
        lastClaimedAt: rakeback.lastClaimedAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting rakeback status:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

