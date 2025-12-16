// Simple storage for Vercel serverless functions
// Uses in-memory storage (ephemeral) - for production, replace with Vercel KV or database

import type { Wager, RakebackConfig, PlayerRakeback, AuditLog } from './types';

// In-memory storage (ephemeral - resets on cold start)
// For production, replace with Vercel KV or database
let configStore: RakebackConfig | null = null;
let wagersStore: Wager[] = [];
let playerRakebackStore: Record<string, PlayerRakeback> = {};
let auditLogsStore: AuditLog[] = [];

// Default config
const DEFAULT_CONFIG: RakebackConfig = {
  enabled: false,
  rakebackPercentage: 10.0,
  overridePercentage: 100.0,
  casinoRtpFloors: {
    SLOTS: 0.90,
    LIVE: 0.95,
    TABLE: 0.92,
    CRASH: 0.88,
    OTHER: 0.90,
  },
  globalMargin: 0.08,
  sportMarginFloors: {
    FOOTBALL: 0.08,
    TENNIS: 0.10,
    BASKETBALL: 0.09,
    ESPORTS: 0.12,
    OTHER: 0.08,
  },
  sportMarginOverrides: {},
  lastUpdated: new Date().toISOString(),
};

// Try to load from file system (for local dev), fallback to in-memory
function tryLoadFromFile<T>(filePath: string, defaultValue: T): T {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const data = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    // Ignore - use in-memory
  }
  return defaultValue;
}

function trySaveToFile(filePath: string, data: any): void {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  } catch (error) {
    // Ignore - in-memory only
  }
}

export const storage = {
  // Config
  getConfig(): RakebackConfig {
    if (configStore) return configStore;
    configStore = tryLoadFromFile('data/rakeback-config.json', DEFAULT_CONFIG);
    return configStore;
  },

  saveConfig(config: RakebackConfig): void {
    configStore = config;
    trySaveToFile('data/rakeback-config.json', config);
  },

  // Wagers
  getWagers(): Wager[] {
    if (wagersStore.length > 0) return wagersStore;
    wagersStore = tryLoadFromFile('data/wagers.json', []);
    return wagersStore;
  },

  saveWager(wager: Wager): void {
    const wagers = this.getWagers();
    wagers.push(wager);
    wagersStore = wagers;
    trySaveToFile('data/wagers.json', wagers);
  },

  getPlayerWagers(playerId: string): Wager[] {
    return this.getWagers().filter(w => w.playerId === playerId);
  },

  // Player Rakeback
  getPlayerRakeback(playerId: string): PlayerRakeback | null {
    const all = this.getAllPlayerRakeback();
    return all[playerId] || null;
  },

  getAllPlayerRakeback(): Record<string, PlayerRakeback> {
    if (Object.keys(playerRakebackStore).length > 0) return playerRakebackStore;
    playerRakebackStore = tryLoadFromFile('data/player-rakeback.json', {});
    return playerRakebackStore;
  },

  savePlayerRakeback(playerId: string, rakeback: PlayerRakeback): void {
    const all = this.getAllPlayerRakeback();
    all[playerId] = rakeback;
    playerRakebackStore = all;
    trySaveToFile('data/player-rakeback.json', all);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    if (auditLogsStore.length > 0) return auditLogsStore;
    auditLogsStore = tryLoadFromFile('data/audit-logs.json', []);
    return auditLogsStore;
  },

  addAuditLog(log: AuditLog): void {
    const logs = this.getAuditLogs();
    logs.push(log);
    auditLogsStore = logs;
    trySaveToFile('data/audit-logs.json', logs);
  },
};

