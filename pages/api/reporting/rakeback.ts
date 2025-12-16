import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';
import type { RakebackReport } from '../../../lib/rakeback/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allRakeback = storage.getAllPlayerRakeback();
    const players = Object.values(allRakeback);

    const report: RakebackReport = {
      totalPlayers: players.length,
      totalWager: players.reduce((sum, p) => sum + p.totalWager, 0),
      totalCasinoWager: players.reduce((sum, p) => sum + p.casinoWager, 0),
      totalSportsWager: players.reduce((sum, p) => sum + p.sportsWager, 0),
      totalAccruedRakeback: players.reduce((sum, p) => sum + p.accruedRakeback, 0),
      totalClaimedRakeback: players.reduce((sum, p) => sum + p.claimedRakeback, 0),
      players: players.map(p => ({
        playerId: p.playerId,
        totalWager: p.totalWager,
        accruedRakeback: p.accruedRakeback,
        claimedRakeback: p.claimedRakeback,
      })),
    };

    return res.status(200).json(report);
  } catch (error: any) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

