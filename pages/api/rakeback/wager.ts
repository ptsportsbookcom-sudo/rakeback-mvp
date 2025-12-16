import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';
import { recalculatePlayerRakeback } from '../../../lib/rakeback/calculator';
import type { Wager } from '../../../lib/rakeback/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      playerId,
      amount,
      stakeSourceType,
      productType,
      casinoCategory,
      rtp,
      sport,
      betStatus,
    } = req.body;

    // Validation
    if (!playerId || !amount || !stakeSourceType || !productType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (productType === 'CASINO' && (!casinoCategory || !rtp)) {
      return res.status(400).json({ error: 'Casino wagers require category and rtp' });
    }

    if (productType === 'SPORTS' && !sport) {
      return res.status(400).json({ error: 'Sports wagers require sport' });
    }

    // Create wager
    const wager: Wager = {
      id: `wager-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      amount: parseFloat(amount),
      stakeSourceType,
      productType,
      timestamp: new Date().toISOString(),
      casinoCategory,
      rtp: rtp ? parseFloat(rtp) : undefined,
      sport,
      betStatus,
    };

    // Save wager
    storage.saveWager(wager);

    // Recalculate rakeback for player
    const config = storage.getConfig();
    if (config.enabled) {
      const wagers = storage.getWagers();
      const rakeback = recalculatePlayerRakeback(playerId, wagers, config);
      
      // Merge with existing claimed amount
      const existing = storage.getPlayerRakeback(playerId);
      if (existing) {
        rakeback.claimedRakeback = existing.claimedRakeback;
        rakeback.lastClaimedAt = existing.lastClaimedAt;
      }
      
      storage.savePlayerRakeback(playerId, rakeback);
    }

    return res.status(200).json({ success: true, wager });
  } catch (error: any) {
    console.error('Error creating wager:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

