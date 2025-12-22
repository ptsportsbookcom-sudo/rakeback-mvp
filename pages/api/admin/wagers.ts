import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const wagers = storage.getWagers();
    return res.status(200).json(wagers);
  } catch (error: any) {
    console.error('Error getting wagers:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
