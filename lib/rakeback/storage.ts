// Simple storage for Vercel serverless functions
// Uses in-memory storage (ephemeral) - Vercel-safe, no file system

import type { Wager, RakebackConfig, PlayerRakeback, AuditLog } from './types';

// In-memory storage (ephemeral - resets on cold start)
// Vercel-safe: pure in-memory, no file system access
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

export const storage = {
  // Config
  getConfig(): RakebackConfig {
    if (configStore) return configStore;
    configStore = DEFAULT_CONFIG;
    return configStore;
  },

  saveConfig(config: RakebackConfig): void {
    configStore = config;
  },

  // Wagers
  getWagers(): Wager[] {
    return wagersStore;
  },

  saveWager(wager: Wager): void {
    wagersStore.push(wager);
  },

  getPlayerWagers(playerId: string): Wager[] {
    return wagersStore.filter(w => w.playerId === playerId);
  },

  // Player Rakeback
  getPlayerRakeback(playerId: string): PlayerRakeback | null {
    return playerRakebackStore[playerId] || null;
  },

  getAllPlayerRakeback(): Record<string, PlayerRakeback> {
    return playerRakebackStore;
  },

  savePlayerRakeback(playerId: string, rakeback: PlayerRakeback): void {
    playerRakebackStore[playerId] = rakeback;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return auditLogsStore;
  },

  addAuditLog(log: AuditLog): void {
    auditLogsStore.push(log);
  },
};

