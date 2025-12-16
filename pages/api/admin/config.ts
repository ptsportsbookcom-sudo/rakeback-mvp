import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../lib/rakeback/storage';
import type { RakebackConfig } from '../../../lib/rakeback/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const config = storage.getConfig();
      return res.status(200).json(config);
    } catch (error: any) {
      console.error('Error getting config:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const currentConfig = storage.getConfig();
      const updates = req.body as Partial<RakebackConfig>;

      // Track changes for audit
      const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

      // Build new config
      const newConfig: RakebackConfig = {
        ...currentConfig,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };

      // Track changes
      if (updates.enabled !== undefined && updates.enabled !== currentConfig.enabled) {
        changes.push({ field: 'enabled', oldValue: currentConfig.enabled, newValue: updates.enabled });
      }
      if (updates.rakebackPercentage !== undefined && updates.rakebackPercentage !== currentConfig.rakebackPercentage) {
        changes.push({ field: 'rakebackPercentage', oldValue: currentConfig.rakebackPercentage, newValue: updates.rakebackPercentage });
      }
      if (updates.overridePercentage !== undefined && updates.overridePercentage !== currentConfig.overridePercentage) {
        changes.push({ field: 'overridePercentage', oldValue: currentConfig.overridePercentage, newValue: updates.overridePercentage });
      }
      if (updates.casinoRtpFloors && JSON.stringify(updates.casinoRtpFloors) !== JSON.stringify(currentConfig.casinoRtpFloors)) {
        changes.push({ field: 'casinoRtpFloors', oldValue: currentConfig.casinoRtpFloors, newValue: updates.casinoRtpFloors });
      }
      if (updates.globalMargin !== undefined && updates.globalMargin !== currentConfig.globalMargin) {
        changes.push({ field: 'globalMargin', oldValue: currentConfig.globalMargin, newValue: updates.globalMargin });
      }
      if (updates.sportMarginFloors && JSON.stringify(updates.sportMarginFloors) !== JSON.stringify(currentConfig.sportMarginFloors)) {
        changes.push({ field: 'sportMarginFloors', oldValue: currentConfig.sportMarginFloors, newValue: updates.sportMarginFloors });
      }
      if (updates.sportMarginOverrides && JSON.stringify(updates.sportMarginOverrides) !== JSON.stringify(currentConfig.sportMarginOverrides)) {
        changes.push({ field: 'sportMarginOverrides', oldValue: currentConfig.sportMarginOverrides, newValue: updates.sportMarginOverrides });
      }

      // Save config
      storage.saveConfig(newConfig);

      // Log all changes
      for (const change of changes) {
        storage.addAuditLog({
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          action: `UPDATE_${change.field.toUpperCase()}`,
          field: change.field,
          oldValue: JSON.stringify(change.oldValue),
          newValue: JSON.stringify(change.newValue),
          timestamp: new Date().toISOString(),
          actor: 'admin',
        });
      }

      return res.status(200).json(newConfig);
    } catch (error: any) {
      console.error('Error updating config:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

