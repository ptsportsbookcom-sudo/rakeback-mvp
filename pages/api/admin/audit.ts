import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logs = storage.getAuditLogs();
    return res.status(200).json(logs);
  } catch (error: any) {
    console.error('Error getting audit logs:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}


