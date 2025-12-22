import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';
import { calculatePlayerRakeback } from '../../../lib/rakeback/calculator';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const wagers = storage.getWagers();
    const config = storage.getConfig();
    
    // Group by player
    const players = Array.from(new Set(wagers.map(w => w.playerId)));
    const playerTotals = players.map(playerId => {
      const playerWagers = wagers.filter(w => w.playerId === playerId);
      const rakeback = calculatePlayerRakeback(playerWagers, config);
      const existing = storage.getPlayerRakeback(playerId);
      
      return {
        playerId,
        totalWager: rakeback.totalWager,
        accruedRakeback: rakeback.accruedRakeback,
        claimedRakeback: existing?.claimedRakeback || 0,
        wagerCount: playerWagers.length,
      };
    });

    return res.status(200).json(playerTotals);
  } catch (error: any) {
    console.error('Error getting players:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

