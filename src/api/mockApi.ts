import type {
  Achievement,
  Player,
  PlayerAchievementProgress,
  AchievementProgressStatus,
  TransactionLog,
  PlayerWallet,
  TriggerType,
  VerticalType,
  BonusTemplate,
  BonusInstance,
  Challenge,
  PlayerChallengeProgress,
  Quest,
  PlayerQuestProgress,
} from '../types';
import { DEFAULT_BONUS_TEMPLATES } from '../core/rewards/templates';

const STORAGE_KEYS = {
  ACHIEVEMENTS: 'achievements',
  PLAYERS: 'players',
  PROGRESS: 'player_achievement_progress',
  TRANSACTIONS: 'transaction_logs',
  WALLETS: 'player_wallets',
  BONUS_TEMPLATES: 'bonus_templates',
  PLAYER_BONUSES: 'player_bonuses',
  CHALLENGES: 'challenges',
  CHALLENGE_PROGRESS: 'player_challenge_progress',
  QUESTS: 'quests',
  QUEST_PROGRESS: 'player_quest_progress',
};

// In-memory fallback
let inMemoryData: {
  achievements: Achievement[];
  players: Player[];
  progress: PlayerAchievementProgress[];
  transactions: TransactionLog[];
  wallets: PlayerWallet[];
  bonusTemplates: BonusTemplate[];
  playerBonuses: BonusInstance[];
  challenges: Challenge[];
  challengeProgress: PlayerChallengeProgress[];
  quests: Quest[];
  questProgress: PlayerQuestProgress[];
} = {
  achievements: [],
  players: [],
  progress: [],
  transactions: [],
  wallets: [],
  bonusTemplates: [],
  playerBonuses: [],
  challenges: [],
  challengeProgress: [],
  quests: [],
  questProgress: [],
};

// Initialize default player
const DEFAULT_PLAYER_ID = 'player-1';

function initDefaultPlayer() {
  const players = getFromStorage<Player[]>(STORAGE_KEYS.PLAYERS, []);
  if (players.length === 0) {
    const defaultPlayer: Player = {
      id: DEFAULT_PLAYER_ID,
      name: 'Demo Player',
      email: 'player@demo.com',
    };
    saveToStorage(STORAGE_KEYS.PLAYERS, [defaultPlayer]);
  }

  const wallets = getFromStorage<PlayerWallet[]>(STORAGE_KEYS.WALLETS, []);
  if (!wallets.find(w => w.playerId === DEFAULT_PLAYER_ID)) {
    wallets.push({ playerId: DEFAULT_PLAYER_ID, rewardPoints: 0 });
    saveToStorage(STORAGE_KEYS.WALLETS, wallets);
  }
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

function loadData() {
  inMemoryData = {
    achievements: getFromStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []),
    players: getFromStorage<Player[]>(STORAGE_KEYS.PLAYERS, []),
    progress: getFromStorage<PlayerAchievementProgress[]>(STORAGE_KEYS.PROGRESS, []),
    transactions: getFromStorage<TransactionLog[]>(STORAGE_KEYS.TRANSACTIONS, []),
    wallets: getFromStorage<PlayerWallet[]>(STORAGE_KEYS.WALLETS, []),
    bonusTemplates: getFromStorage<BonusTemplate[]>(STORAGE_KEYS.BONUS_TEMPLATES, DEFAULT_BONUS_TEMPLATES),
    playerBonuses: getFromStorage<BonusInstance[]>(STORAGE_KEYS.PLAYER_BONUSES, []),
    challenges: getFromStorage<Challenge[]>(STORAGE_KEYS.CHALLENGES, []),
    challengeProgress: getFromStorage<PlayerChallengeProgress[]>(STORAGE_KEYS.CHALLENGE_PROGRESS, []),
    quests: getFromStorage<Quest[]>(STORAGE_KEYS.QUESTS, []),
    questProgress: getFromStorage<PlayerQuestProgress[]>(STORAGE_KEYS.QUEST_PROGRESS, []),
  };
  
  // Initialize bonus templates if empty
  if (inMemoryData.bonusTemplates.length === 0) {
    inMemoryData.bonusTemplates = DEFAULT_BONUS_TEMPLATES;
    saveToStorage(STORAGE_KEYS.BONUS_TEMPLATES, DEFAULT_BONUS_TEMPLATES);
  }
  
  initDefaultPlayer();
}

function saveData() {
  saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, inMemoryData.achievements);
  saveToStorage(STORAGE_KEYS.PLAYERS, inMemoryData.players);
  saveToStorage(STORAGE_KEYS.PROGRESS, inMemoryData.progress);
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, inMemoryData.transactions);
  saveToStorage(STORAGE_KEYS.WALLETS, inMemoryData.wallets);
  saveToStorage(STORAGE_KEYS.BONUS_TEMPLATES, inMemoryData.bonusTemplates);
  saveToStorage(STORAGE_KEYS.PLAYER_BONUSES, inMemoryData.playerBonuses);
  saveToStorage(STORAGE_KEYS.CHALLENGES, inMemoryData.challenges);
  saveToStorage(STORAGE_KEYS.CHALLENGE_PROGRESS, inMemoryData.challengeProgress);
  saveToStorage(STORAGE_KEYS.QUESTS, inMemoryData.quests);
  saveToStorage(STORAGE_KEYS.QUEST_PROGRESS, inMemoryData.questProgress);
}

// Initialize on load
loadData();

// API Functions
export const api = {
  // Achievements
  getAchievements: (): Achievement[] => {
    loadData();
    return inMemoryData.achievements;
  },

  getAchievement: (id: string): Achievement | undefined => {
    loadData();
    return inMemoryData.achievements.find(a => a.id === id);
  },

  createAchievement: (achievement: Omit<Achievement, 'id' | 'createdAt'>): Achievement => {
    loadData();
    const newAchievement: Achievement = {
      ...achievement,
      id: `ach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    inMemoryData.achievements.push(newAchievement);
    saveData();
    return newAchievement;
  },

  updateAchievement: (id: string, updates: Partial<Achievement>): Achievement | null => {
    loadData();
    const index = inMemoryData.achievements.findIndex(a => a.id === id);
    if (index === -1) return null;
    inMemoryData.achievements[index] = {
      ...inMemoryData.achievements[index],
      ...updates,
    };
    saveData();
    return inMemoryData.achievements[index];
  },

  deleteAchievement: (id: string): boolean => {
    loadData();
    const index = inMemoryData.achievements.findIndex(a => a.id === id);
    if (index === -1) return false;
    inMemoryData.achievements.splice(index, 1);
    saveData();
    return true;
  },

  // Player Achievements
  getPlayerAchievements: (playerId: string): PlayerAchievementProgress[] => {
    loadData();
    return inMemoryData.progress.filter(p => p.playerId === playerId);
  },

  getPlayerAchievement: (playerId: string, achievementId: string): PlayerAchievementProgress | undefined => {
    loadData();
    return inMemoryData.progress.find(
      p => p.playerId === playerId && p.achievementId === achievementId
    );
  },

  updatePlayerProgress: (
    playerId: string,
    achievementId: string,
    progress: number,
    currentValue: number,
    targetValue: number
  ): PlayerAchievementProgress => {
    loadData();
    let existing = inMemoryData.progress.find(
      p => p.playerId === playerId && p.achievementId === achievementId
    );

    const completed = progress >= 100;
    const wasCompleted = existing?.completed || false;
    
    // Determine status: IN_PROGRESS -> COMPLETED -> CLAIMED
    let status: AchievementProgressStatus = 'IN_PROGRESS';
    if (existing?.claimed) {
      status = 'CLAIMED';
    } else if (completed) {
      status = 'COMPLETED';
    }

    if (existing) {
      existing.progress = progress;
      existing.currentValue = currentValue;
      existing.targetValue = targetValue;
      existing.lastUpdate = new Date().toISOString();
      existing.completed = completed;
      existing.status = status;
      // Keep claimed flag unchanged (only claimReward can set it to true)
    } else {
      existing = {
        playerId,
        achievementId,
        progress,
        currentValue,
        targetValue,
        lastUpdate: new Date().toISOString(),
        completed,
        claimed: false,
        status,
      };
      inMemoryData.progress.push(existing);
    }

    // If just completed, create transaction log (for tracking only, NO RP added)
    if (completed && !wasCompleted) {
      const achievement = inMemoryData.achievements.find(a => a.id === achievementId);
      if (achievement) {
        const rewardType = achievement.reward?.type || (achievement.rewardPoints && achievement.rewardPoints > 0 ? 'points' : undefined);
        if (rewardType) {
          const points = achievement.reward?.points || achievement.rewardPoints || 0;
          const transaction: TransactionLog = {
            id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            playerId,
            achievementId,
            triggerType: achievement.trigger.type,
            vertical: achievement.vertical,
            rewardPoints: points, // kept for backward compatibility
            bonusGranted: rewardType === 'bonus' || rewardType === 'both',
            timestamp: new Date().toISOString(),
            status: 'completed', // Will change to 'claimed' when reward is claimed
          };
          inMemoryData.transactions.push(transaction);
        }
      }
    }

    saveData();
    return existing;
  },

  claimReward: (playerId: string, achievementId: string): boolean => {
    loadData();
    const progress = inMemoryData.progress.find(
      p => p.playerId === playerId && p.achievementId === achievementId
    );
    
    // Only allow claiming if status is COMPLETED (not IN_PROGRESS, not already CLAIMED)
    if (!progress || !progress.completed || progress.claimed) {
      return false;
    }
    
    // Double-check status
    if (progress.status && progress.status !== 'COMPLETED') {
      return false;
    }

    const achievement = inMemoryData.achievements.find(a => a.id === achievementId);
    if (!achievement) {
      return false;
    }

    // Determine reward type (backward compatible: check rewardPoints first, then new reward object)
    const rewardType = achievement.reward?.type || (achievement.rewardPoints && achievement.rewardPoints > 0 ? 'points' : undefined);
    
    if (!rewardType) {
      return false; // No reward configured
    }

    let hasReward = false;

    // Handle Points reward
    if (rewardType === 'points' || rewardType === 'both') {
      const pointsAmount = achievement.reward?.points || achievement.rewardPoints || 0;
      if (pointsAmount > 0) {
        let wallet = inMemoryData.wallets.find(w => w.playerId === playerId);
        if (!wallet) {
          wallet = { playerId, rewardPoints: 0 };
          inMemoryData.wallets.push(wallet);
        }
        wallet.rewardPoints += pointsAmount;
        hasReward = true;
      }
    }

    // Handle Bonus reward
    if (rewardType === 'bonus' || rewardType === 'both') {
      const templateId = achievement.reward?.bonusTemplateId;
      if (templateId) {
        const template = inMemoryData.bonusTemplates.find(t => t.id === templateId);
        if (template) {
          const bonus: BonusInstance = {
            id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            playerId,
            achievementId,
            templateId: template.id,
            templateName: template.name,
            type: template.type,
            amount: template.defaultAmount,
            wagering: template.defaultWagering,
            status: 'active',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            sourceType: 'achievement',
            sourceId: achievementId,
            wageringRequired: template.defaultWagering,
            wageringProgress: 0,
          };
          inMemoryData.playerBonuses.push(bonus);
          hasReward = true;
        }
      }
    }

    if (!hasReward) {
      return false;
    }

    // Update status to CLAIMED
    progress.claimed = true;
    progress.status = 'CLAIMED';

    // Update transaction status
    const transaction = inMemoryData.transactions.find(
      t => t.playerId === playerId && t.achievementId === achievementId && t.status === 'completed'
    );
    if (transaction) {
      transaction.status = 'claimed';
      transaction.bonusGranted = rewardType === 'bonus' || rewardType === 'both';
    }

    saveData();
    return true;
  },

  // Transaction Logs
  getTransactionLogs: (): TransactionLog[] => {
    loadData();
    return inMemoryData.transactions;
  },

  // Wallet
  getWallet: (playerId: string): PlayerWallet => {
    loadData();
    let wallet = inMemoryData.wallets.find(w => w.playerId === playerId);
    if (!wallet) {
      wallet = { playerId, rewardPoints: 0 };
      inMemoryData.wallets.push(wallet);
      saveData();
    }
    return wallet;
  },

  // Simulation helpers
  simulateAction: (
    playerId: string,
    action: {
      type: TriggerType;
      vertical?: VerticalType;
      amount?: number;
      verificationType?: 'email' | 'phone' | 'kyc';
      // win-related
      isWin?: boolean;
      winAmount?: number;
      // game metadata
      provider?: string;
      category?: string;
      gameId?: string;
      sportType?: string;
      country?: string;
      league?: string;
      eventId?: string;
      marketType?: string;
      // other metrics
      isWithdrawal?: boolean;
      referrals?: number;
      profileCompleted?: boolean;
      accountAgeDays?: number;
      netDelta?: number; // positive for win, negative for loss
    }
  ): void => {
    loadData();
    const activeAchievements = inMemoryData.achievements.filter(a => a.status === 'active');
    
    for (const achievement of activeAchievements) {
      // Check if achievement matches the action
      if (achievement.trigger.type !== action.type) continue;
      
      // Check vertical match
      if (achievement.vertical === 'cross_vertical') {
        // Cross-vertical matches any vertical
      } else if (action.vertical && achievement.vertical !== action.vertical) {
        continue;
      }

      // Helper to evaluate filters for game-dependent triggers
      const matchesFilters = (): boolean => {
        if (!achievement.filters) return true;

        // Casino / Live casino filters
        if (achievement.vertical === 'casino' || achievement.vertical === 'live_casino') {
          const filters = achievement.filters as any;
          if (filters.providers?.length && action.provider && !filters.providers.includes(action.provider)) return false;
          if (filters.gameCategories?.length && action.category && !filters.gameCategories.includes(action.category)) return false;
          if (filters.games?.length && action.gameId && !filters.games.includes(action.gameId)) return false;
        }

        // Sportsbook filters
        if (achievement.vertical === 'sportsbook') {
          const filters = achievement.filters as any;
          if (filters.sportTypes?.length && action.sportType && !filters.sportTypes.includes(action.sportType)) return false;
          if (filters.countries?.length && action.country && !filters.countries.includes(action.country)) return false;
          if (filters.leagues?.length && action.league && !filters.leagues.includes(action.league)) return false;
          if (filters.events?.length && action.eventId && !filters.events.includes(action.eventId)) return false;
          if (filters.marketTypes?.length && action.marketType && !filters.marketTypes.includes(action.marketType)) return false;
        }

        // Cross-vertical allows combined filters
        if (achievement.vertical === 'cross_vertical') {
          const filters = achievement.filters as any;
          if (filters?.casino) {
            if (filters.casino.providers?.length && action.provider && !filters.casino.providers.includes(action.provider)) return false;
            if (filters.casino.gameCategories?.length && action.category && !filters.casino.gameCategories.includes(action.category)) return false;
            if (filters.casino.games?.length && action.gameId && !filters.casino.games.includes(action.gameId)) return false;
          }
          if (filters?.sports) {
            if (filters.sports.sportTypes?.length && action.sportType && !filters.sports.sportTypes.includes(action.sportType)) return false;
            if (filters.sports.countries?.length && action.country && !filters.sports.countries.includes(action.country)) return false;
            if (filters.sports.leagues?.length && action.league && !filters.sports.leagues.includes(action.league)) return false;
            if (filters.sports.events?.length && action.eventId && !filters.sports.events.includes(action.eventId)) return false;
            if (filters.sports.marketTypes?.length && action.marketType && !filters.sports.marketTypes.includes(action.marketType)) return false;
          }
        }

        return true;
      };

      let shouldUpdate = false;
      let newValue = 0;
      let targetValue = 0;

      switch (achievement.trigger.type) {
        case 'login_streak':
          // For simulation, increment by 1 day
          const existingProgress = inMemoryData.progress.find(
            p => p.playerId === playerId && p.achievementId === achievement.id
          );
          newValue = (existingProgress?.currentValue || 0) + 1;
          targetValue = achievement.trigger.days || 1;
          shouldUpdate = true;
          break;

        case 'game_turnover': {
          if (action.amount !== undefined) {
            // Only count turnover if it meets the minimum per-transaction amount (if set)
            const meetsMinimum =
              achievement.trigger.minimumAmount === undefined ||
              action.amount >= (achievement.trigger.minimumAmount || 0);

            if (meetsMinimum) {
              const existingProgress = inMemoryData.progress.find(
                p => p.playerId === playerId && p.achievementId === achievement.id
              );
              // For turnover, quantity represents the target total turnover amount
              newValue = (existingProgress?.currentValue || 0) + action.amount;
              targetValue =
                achievement.trigger.quantity ||
                achievement.trigger.minimumAmount ||
                0;
              shouldUpdate = targetValue > 0;
            }
          }
          break;
        }

        case 'game_transaction': {
          if (action.amount !== undefined) {
            // Count transactions; respect minimum per-transaction amount if provided
            const meetsMinimum =
              achievement.trigger.minimumAmount === undefined ||
              action.amount >= (achievement.trigger.minimumAmount || 0);

            if (meetsMinimum) {
              const existingProgress = inMemoryData.progress.find(
                p => p.playerId === playerId && p.achievementId === achievement.id
              );
              newValue = (existingProgress?.currentValue || 0) + 1;
              targetValue = achievement.trigger.quantity || 1;
              shouldUpdate = true;
            }
          }
          break;
        }

        case 'deposit':
          if (action.amount !== undefined) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            newValue = (existingProgress?.currentValue || 0) + 1; // Count
            targetValue = achievement.trigger.numberOfDeposits || 1;
            shouldUpdate = true;
          }
          break;

        case 'user_verification':
          if (action.verificationType === achievement.trigger.verificationType) {
            newValue = 1;
            targetValue = 1;
            shouldUpdate = true;
          }
          break;

        // New game-dependent metrics
        case 'winning_bets_count': {
          if (action.isWin && matchesFilters()) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            newValue = (existingProgress?.currentValue || 0) + 1;
            targetValue = achievement.trigger.winningBetsTarget || 1;
            shouldUpdate = true;
          }
          break;
        }

        case 'total_win_amount': {
          if (action.isWin && action.winAmount !== undefined && matchesFilters()) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            newValue = (existingProgress?.currentValue || 0) + (action.winAmount || 0);
            targetValue = achievement.trigger.totalWinAmountTarget || 0;
            shouldUpdate = targetValue > 0;
          }
          break;
        }

        case 'max_single_win': {
          if (action.isWin && action.winAmount !== undefined && matchesFilters()) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            const currentMax = existingProgress?.currentValue || 0;
            newValue = Math.max(currentMax, action.winAmount);
            targetValue = achievement.trigger.maxSingleWinMinimum || 0;
            shouldUpdate = targetValue > 0 && newValue >= targetValue;
            // For max win we treat completion as hitting/exceeding the threshold
            if (shouldUpdate) {
              const progress = 100;
              api.updatePlayerProgress(playerId, achievement.id, progress, newValue, targetValue);
              continue;
            }
          }
          break;
        }

        case 'consecutive_wins': {
          if (action.isWin !== undefined) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            const currentStreak = action.isWin ? (existingProgress?.currentValue || 0) + 1 : 0;
            newValue = currentStreak;
            targetValue = achievement.trigger.winStreakTarget || 1;
            shouldUpdate = true;
          }
          break;
        }

        case 'specific_game_engagement': {
          if (matchesFilters()) {
            const targetId = achievement.trigger.specificGameId || achievement.trigger.specificEventId;
            const matchesTarget =
              (targetId && (action.gameId === targetId || action.eventId === targetId)) ||
              (!targetId); // if not set, count all engagements that pass filters

            if (matchesTarget) {
              const existingProgress = inMemoryData.progress.find(
                p => p.playerId === playerId && p.achievementId === achievement.id
              );
              newValue = (existingProgress?.currentValue || 0) + 1;
              targetValue = achievement.trigger.specificGameTargetCount || 1;
              shouldUpdate = true;
            }
          }
          break;
        }

        case 'market_specific_bets': {
          if (matchesFilters()) {
            const requiredMarket = achievement.trigger.marketTypeRequired;
            if (!requiredMarket || action.marketType === requiredMarket) {
              const existingProgress = inMemoryData.progress.find(
                p => p.playerId === playerId && p.achievementId === achievement.id
              );
              newValue = (existingProgress?.currentValue || 0) + 1;
              targetValue = achievement.trigger.quantity || 1;
              shouldUpdate = true;
            }
          }
          break;
        }

        // New non-game-dependent metrics
        case 'total_deposit_amount': {
          if (action.amount !== undefined) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            newValue = (existingProgress?.currentValue || 0) + action.amount;
            targetValue = achievement.trigger.totalDepositAmountTarget || 0;
            shouldUpdate = targetValue > 0;
          }
          break;
        }

        case 'withdrawal': {
          if (action.isWithdrawal) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            const countTarget = achievement.trigger.withdrawalCountTarget;
            const amountTarget = achievement.trigger.withdrawalAmountTarget;

            let progressByCount: number | null = null;
            let progressByAmount: number | null = null;

            const nextCount = (existingProgress?.currentValue || 0) + 1;
            const nextAmount = (existingProgress?.targetValue || 0) + (action.amount || 0);

            if (countTarget) {
              progressByCount = Math.min(100, (nextCount / countTarget) * 100);
            }
            if (amountTarget) {
              progressByAmount = Math.min(100, (nextAmount / amountTarget) * 100);
            }

            // Choose the better progress if both exist
            if (progressByCount !== null || progressByAmount !== null) {
              const chosenProgress = Math.max(progressByCount || 0, progressByAmount || 0);
              newValue = progressByAmount !== null ? nextAmount : nextCount;
              targetValue = progressByAmount !== null ? (amountTarget || 1) : (countTarget || 1);
              shouldUpdate = true;
              api.updatePlayerProgress(
                playerId,
                achievement.id,
                chosenProgress,
                newValue,
                targetValue
              );
              continue;
            }
          }
          break;
        }

        case 'referral_count': {
          const increment = action.referrals || 1;
          const existingProgress = inMemoryData.progress.find(
            p => p.playerId === playerId && p.achievementId === achievement.id
          );
          newValue = (existingProgress?.currentValue || 0) + increment;
          targetValue = achievement.trigger.referralCountTarget || 1;
          shouldUpdate = true;
          break;
        }

        case 'account_longevity': {
          if (action.accountAgeDays !== undefined) {
            newValue = action.accountAgeDays;
            targetValue = achievement.trigger.accountAgeDaysTarget || 0;
            shouldUpdate = targetValue > 0;
          }
          break;
        }

        case 'profile_completion': {
          if (action.profileCompleted) {
            newValue = 1;
            targetValue = 1;
            shouldUpdate = true;
          }
          break;
        }

        case 'net_result': {
          if (action.netDelta !== undefined) {
            const existingProgress = inMemoryData.progress.find(
              p => p.playerId === playerId && p.achievementId === achievement.id
            );
            const current = existingProgress?.currentValue || 0;
            newValue = current + action.netDelta;

            const targets: number[] = [];
            if (achievement.trigger.netWinTarget !== undefined && achievement.trigger.netWinTarget > 0) {
              targets.push(achievement.trigger.netWinTarget);
            }
            if (achievement.trigger.netLossTarget !== undefined && achievement.trigger.netLossTarget < 0) {
              targets.push(achievement.trigger.netLossTarget);
            }

            if (targets.length) {
              // Check completion against whichever target is closer to being met
              const completion = targets.some(t => (t > 0 ? newValue >= t : newValue <= t));
              targetValue = targets[0];
              shouldUpdate = true;
              const progress = completion ? 100 : Math.min(100, Math.abs((newValue / targetValue) * 100));
              api.updatePlayerProgress(playerId, achievement.id, progress, newValue, targetValue);
              continue;
            }
          }
          break;
        }
      }

      if (shouldUpdate && targetValue > 0) {
        const progress = Math.min(100, (newValue / targetValue) * 100);
        api.updatePlayerProgress(playerId, achievement.id, progress, newValue, targetValue);
      }
    }

    // Update Challenges with same trigger
    const activeChallenges = inMemoryData.challenges.filter(c => c.status === 'active');
    for (const challenge of activeChallenges) {
      if (challenge.trigger.type !== action.type) continue;
      
      // Check date range
      const now = new Date();
      const startDate = new Date(challenge.startDate);
      const endDate = challenge.endDate ? new Date(challenge.endDate) : null;
      if (now < startDate || (endDate && now > endDate)) continue;

      // Simplified progress update for challenges
      const existingProgress = inMemoryData.challengeProgress.find(
        p => p.playerId === playerId && p.challengeId === challenge.id
      );
      
      let newValue = 0;
      let targetValue = 0;
      
      if (challenge.trigger.type === 'login_streak') {
        newValue = (existingProgress?.currentValue || 0) + 1;
        targetValue = challenge.trigger.days || 1;
      } else if (action.amount !== undefined) {
        newValue = (existingProgress?.currentValue || 0) + (action.amount || 0);
        targetValue = challenge.trigger.quantity || challenge.trigger.minimumAmount || 1;
      } else {
        newValue = (existingProgress?.currentValue || 0) + 1;
        targetValue = challenge.trigger.quantity || 1;
      }

      if (targetValue > 0) {
        const progress = Math.min(100, (newValue / targetValue) * 100);
        api.updateChallengeProgress(playerId, challenge.id, progress, newValue, targetValue);
      }
    }

    // Update Quests
    const activeQuests = inMemoryData.quests.filter(q => q.status === 'active');
    for (const quest of activeQuests) {
      for (const step of quest.steps) {
        if (step.trigger.type !== action.type) continue;

        const existingQuestProgress = inMemoryData.questProgress.find(
          p => p.playerId === playerId && p.questId === quest.id
        );
        const stepProgress = existingQuestProgress?.stepProgress[step.id];
        
        let newValue = 0;
        const targetValue = step.targetValue;

        if (step.trigger.type === 'login_streak') {
          newValue = (stepProgress?.currentValue || 0) + 1;
        } else if (action.amount !== undefined) {
          newValue = (stepProgress?.currentValue || 0) + (action.amount || 0);
        } else {
          newValue = (stepProgress?.currentValue || 0) + 1;
        }

        if (targetValue > 0) {
          const progress = Math.min(100, (newValue / targetValue) * 100);
          api.updateQuestStepProgress(playerId, quest.id, step.id, progress, newValue, targetValue);
        }
      }
    }
  },

  // Bonus Templates
  getBonusTemplates: (): BonusTemplate[] => {
    loadData();
    return inMemoryData.bonusTemplates;
  },

  getBonusTemplate: (id: string): BonusTemplate | undefined => {
    loadData();
    return inMemoryData.bonusTemplates.find(t => t.id === id);
  },

  // Player Bonuses
  getPlayerBonuses: (playerId: string): BonusInstance[] => {
    loadData();
    return inMemoryData.playerBonuses.filter(b => b.playerId === playerId);
  },

  getAllPlayerBonuses: (): BonusInstance[] => {
    loadData();
    return inMemoryData.playerBonuses;
  },

  // Analytics
  getAnalytics: () => {
    loadData();
    const completedProgress = inMemoryData.progress.filter(p => p.completed);
    const claimedProgress = inMemoryData.progress.filter(p => p.claimed);
    
    let totalRP = 0;
    let totalBonuses = 0;
    const bonusBreakdown = {
      freebet: 0,
      freespins: 0,
      cash: 0,
    };
    
    claimedProgress.forEach(p => {
      const achievement = inMemoryData.achievements.find(a => a.id === p.achievementId);
      if (achievement) {
        const rewardType = achievement.reward?.type || (achievement.rewardPoints && achievement.rewardPoints > 0 ? 'points' : undefined);
        
        if (rewardType === 'points' || rewardType === 'both') {
          const points = achievement.reward?.points || achievement.rewardPoints || 0;
          totalRP += points;
        }
        
        if (rewardType === 'bonus' || rewardType === 'both') {
          totalBonuses++;
          const bonus = inMemoryData.playerBonuses.find(b => b.achievementId === achievement.id && b.playerId === p.playerId);
          if (bonus) {
            bonusBreakdown[bonus.type]++;
          }
        }
      }
    });

    const achievementCompletions: Record<string, number> = {};
    completedProgress.forEach(p => {
      achievementCompletions[p.achievementId] = (achievementCompletions[p.achievementId] || 0) + 1;
    });

    const rewardDistribution: Record<string, { points: number; bonus: number; both: number }> = {};
    inMemoryData.achievements.forEach(a => {
      const rewardType = a.reward?.type || (a.rewardPoints && a.rewardPoints > 0 ? 'points' : 'none');
      if (rewardType !== 'none') {
        if (!rewardDistribution[a.id]) {
          rewardDistribution[a.id] = { points: 0, bonus: 0, both: 0 };
        }
        if (rewardType === 'points') rewardDistribution[a.id].points++;
        if (rewardType === 'bonus') rewardDistribution[a.id].bonus++;
        if (rewardType === 'both') rewardDistribution[a.id].both++;
      }
    });

    // Challenges analytics
    const challengeProgress = inMemoryData.challengeProgress.filter(p => p.completed);
    const challengeCompletions: Record<string, number> = {};
    challengeProgress.forEach(p => {
      challengeCompletions[p.challengeId] = (challengeCompletions[p.challengeId] || 0) + 1;
    });

    const challengeRewardDistribution: Record<string, { points: number; bonus: number; both: number }> = {};
    inMemoryData.challenges.forEach(c => {
      const rewardType = c.reward?.type || c.rewardType || (c.rewardPoints && c.rewardPoints > 0 ? 'points' : undefined);
      if (rewardType) {
        if (!challengeRewardDistribution[c.id]) {
          challengeRewardDistribution[c.id] = { points: 0, bonus: 0, both: 0 };
        }
        if (rewardType === 'points') challengeRewardDistribution[c.id].points++;
        if (rewardType === 'bonus') challengeRewardDistribution[c.id].bonus++;
        if (rewardType === 'both') challengeRewardDistribution[c.id].both++;
      }
    });

    // Quests analytics
    const questProgress = inMemoryData.questProgress.filter(p => p.completed);
    const questCompletions: Record<string, number> = {};
    questProgress.forEach(p => {
      questCompletions[p.questId] = (questCompletions[p.questId] || 0) + 1;
    });

    const questRewardDistribution: Record<string, { points: number; bonus: number; both: number }> = {};
    inMemoryData.quests.forEach(q => {
      const rewardType = q.reward?.type || q.rewardType || (q.rewardPoints && q.rewardPoints > 0 ? 'points' : undefined);
      if (rewardType) {
        if (!questRewardDistribution[q.id]) {
          questRewardDistribution[q.id] = { points: 0, bonus: 0, both: 0 };
        }
        if (rewardType === 'points') questRewardDistribution[q.id].points++;
        if (rewardType === 'bonus') questRewardDistribution[q.id].bonus++;
        if (rewardType === 'both') questRewardDistribution[q.id].both++;
      }
    });

    return {
      global: {
        totalAchievementCompletions: completedProgress.length,
        totalChallengeCompletions: challengeProgress.length,
        totalQuestCompletions: questProgress.length,
        totalCompletions: completedProgress.length + challengeProgress.length + questProgress.length,
        totalRP,
        totalBonuses,
      },
      bonus: {
        freebet: bonusBreakdown.freebet,
        freespins: bonusBreakdown.freespins,
        cash: bonusBreakdown.cash,
        total: totalBonuses,
        redemptions: inMemoryData.playerBonuses.filter(b => b.status === 'used').length,
      },
      achievements: {
        completions: achievementCompletions,
        rewardDistribution,
      },
      challenges: {
        completions: challengeCompletions,
        rewardDistribution: challengeRewardDistribution,
      },
      quests: {
        completions: questCompletions,
        rewardDistribution: questRewardDistribution,
      },
    };
  },

  // Challenges API
  getChallenges: (): Challenge[] => {
    loadData();
    return inMemoryData.challenges;
  },

  getChallenge: (id: string): Challenge | undefined => {
    loadData();
    return inMemoryData.challenges.find(c => c.id === id);
  },

  createChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt'>): Challenge => {
    loadData();
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    inMemoryData.challenges.push(newChallenge);
    saveData();
    return newChallenge;
  },

  updateChallenge: (id: string, updates: Partial<Challenge>): Challenge | null => {
    loadData();
    const index = inMemoryData.challenges.findIndex(c => c.id === id);
    if (index === -1) return null;
    inMemoryData.challenges[index] = {
      ...inMemoryData.challenges[index],
      ...updates,
    };
    saveData();
    return inMemoryData.challenges[index];
  },

  deleteChallenge: (id: string): boolean => {
    loadData();
    const index = inMemoryData.challenges.findIndex(c => c.id === id);
    if (index === -1) return false;
    inMemoryData.challenges.splice(index, 1);
    saveData();
    return true;
  },

  getPlayerChallengeProgress: (playerId: string, challengeId: string): PlayerChallengeProgress | undefined => {
    loadData();
    return inMemoryData.challengeProgress.find(
      p => p.playerId === playerId && p.challengeId === challengeId
    );
  },

  getPlayerChallenges: (playerId: string): PlayerChallengeProgress[] => {
    loadData();
    return inMemoryData.challengeProgress.filter(p => p.playerId === playerId);
  },

  updateChallengeProgress: (
    playerId: string,
    challengeId: string,
    progress: number,
    currentValue: number,
    targetValue: number
  ): PlayerChallengeProgress => {
    loadData();
    const challenge = inMemoryData.challenges.find(c => c.id === challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if cycle needs reset
    const now = new Date();
    let existing = inMemoryData.challengeProgress.find(
      p => p.playerId === playerId && p.challengeId === challengeId
    );

    const cycleEnd = existing ? new Date(existing.cycleEndDate) : new Date(challenge.startDate);
    if (now > cycleEnd && challenge.autoReset) {
      // Reset progress for new cycle
      const newCycleStart = new Date(cycleEnd);
      let newCycleEnd: Date;
      switch (challenge.frequency) {
        case 'daily':
          newCycleEnd = new Date(newCycleStart);
          newCycleEnd.setDate(newCycleEnd.getDate() + 1);
          break;
        case 'weekly':
          newCycleEnd = new Date(newCycleStart);
          newCycleEnd.setDate(newCycleEnd.getDate() + 7);
          break;
        case 'monthly':
          newCycleEnd = new Date(newCycleStart);
          newCycleEnd.setMonth(newCycleEnd.getMonth() + 1);
          break;
      }
      existing = undefined; // Reset
    }

    const completed = progress >= 100;

    if (existing) {
      existing.progress = progress;
      existing.currentValue = currentValue;
      existing.targetValue = targetValue;
      existing.lastUpdate = new Date().toISOString();
      existing.completed = completed;
      existing.status = existing.claimed ? 'CLAIMED' : completed ? 'COMPLETED' : 'IN_PROGRESS';
    } else {
      const cycleStart = new Date(challenge.startDate);
      let cycleEnd: Date;
      switch (challenge.frequency) {
        case 'daily':
          cycleEnd = new Date(cycleStart);
          cycleEnd.setDate(cycleEnd.getDate() + 1);
          break;
        case 'weekly':
          cycleEnd = new Date(cycleStart);
          cycleEnd.setDate(cycleEnd.getDate() + 7);
          break;
        case 'monthly':
          cycleEnd = new Date(cycleStart);
          cycleEnd.setMonth(cycleEnd.getMonth() + 1);
          break;
      }
      existing = {
        playerId,
        challengeId,
        progress,
        currentValue,
        targetValue,
        lastUpdate: new Date().toISOString(),
        completed,
        claimed: false,
        status: completed ? 'COMPLETED' : 'IN_PROGRESS',
        cycleStartDate: cycleStart.toISOString(),
        cycleEndDate: cycleEnd.toISOString(),
      };
      inMemoryData.challengeProgress.push(existing);
    }

    saveData();
    return existing;
  },

  claimChallengeReward: (playerId: string, challengeId: string): boolean => {
    loadData();
    const progress = inMemoryData.challengeProgress.find(
      p => p.playerId === playerId && p.challengeId === challengeId
    );
    
    if (!progress || !progress.completed || progress.claimed) {
      return false;
    }

    const challenge = inMemoryData.challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return false;
    }

    const rewardType = challenge.reward?.type || challenge.rewardType || (challenge.rewardPoints && challenge.rewardPoints > 0 ? 'points' : undefined);
    if (!rewardType) {
      return false;
    }

    let hasReward = false;

    // Handle Points
    if (rewardType === 'points' || rewardType === 'both') {
      const pointsAmount = challenge.reward?.points || challenge.rewardPoints || 0;
      if (pointsAmount > 0) {
        let wallet = inMemoryData.wallets.find(w => w.playerId === playerId);
        if (!wallet) {
          wallet = { playerId, rewardPoints: 0 };
          inMemoryData.wallets.push(wallet);
        }
        wallet.rewardPoints += pointsAmount;
        hasReward = true;
      }
    }

    // Handle Bonus
    if (rewardType === 'bonus' || rewardType === 'both') {
      const templateId = challenge.reward?.bonusTemplateId;
      if (templateId) {
        const template = inMemoryData.bonusTemplates.find(t => t.id === templateId);
        if (template) {
          const bonus: BonusInstance = {
            id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            playerId,
            achievementId: challengeId, // kept for compatibility
            templateId: template.id,
            templateName: template.name,
            type: template.type,
            amount: template.defaultAmount,
            wagering: template.defaultWagering,
            status: 'active',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            sourceType: 'challenge',
            sourceId: challengeId,
            wageringRequired: template.defaultWagering,
            wageringProgress: 0,
          };
          inMemoryData.playerBonuses.push(bonus);
          hasReward = true;
        }
      }
    }

    if (!hasReward) {
      return false;
    }

    progress.claimed = true;
    progress.status = 'CLAIMED';
    saveData();
    return true;
  },

  // Quests API
  getQuests: (): Quest[] => {
    loadData();
    return inMemoryData.quests;
  },

  getQuest: (id: string): Quest | undefined => {
    loadData();
    return inMemoryData.quests.find(q => q.id === id);
  },

  createQuest: (quest: Omit<Quest, 'id' | 'createdAt'>): Quest => {
    loadData();
    const newQuest: Quest = {
      ...quest,
      id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    inMemoryData.quests.push(newQuest);
    saveData();
    return newQuest;
  },

  updateQuest: (id: string, updates: Partial<Quest>): Quest | null => {
    loadData();
    const index = inMemoryData.quests.findIndex(q => q.id === id);
    if (index === -1) return null;
    inMemoryData.quests[index] = {
      ...inMemoryData.quests[index],
      ...updates,
    };
    saveData();
    return inMemoryData.quests[index];
  },

  deleteQuest: (id: string): boolean => {
    loadData();
    const index = inMemoryData.quests.findIndex(q => q.id === id);
    if (index === -1) return false;
    inMemoryData.quests.splice(index, 1);
    saveData();
    return true;
  },

  getPlayerQuestProgress: (playerId: string, questId: string): PlayerQuestProgress | undefined => {
    loadData();
    return inMemoryData.questProgress.find(
      p => p.playerId === playerId && p.questId === questId
    );
  },

  getPlayerQuests: (playerId: string): PlayerQuestProgress[] => {
    loadData();
    return inMemoryData.questProgress.filter(p => p.playerId === playerId);
  },

  updateQuestStepProgress: (
    playerId: string,
    questId: string,
    stepId: string,
    progress: number,
    currentValue: number,
    targetValue: number
  ): PlayerQuestProgress => {
    loadData();
    const quest = inMemoryData.quests.find(q => q.id === questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    let existing = inMemoryData.questProgress.find(
      p => p.playerId === playerId && p.questId === questId
    );

    const stepCompleted = progress >= 100;

    if (existing) {
      existing.stepProgress[stepId] = {
        progress,
        currentValue,
        targetValue,
        completed: stepCompleted,
        lastUpdate: new Date().toISOString(),
      };
      existing.lastUpdate = new Date().toISOString();
    } else {
      existing = {
        playerId,
        questId,
        stepProgress: {
          [stepId]: {
            progress,
            currentValue,
            targetValue,
            completed: stepCompleted,
            lastUpdate: new Date().toISOString(),
          },
        },
        overallProgress: 0,
        completed: false,
        claimed: false,
        status: 'IN_PROGRESS',
        lastUpdate: new Date().toISOString(),
      };
      inMemoryData.questProgress.push(existing);
    }

    // Calculate overall progress
    const allSteps = quest.steps;
    const completedSteps = allSteps.filter(step => existing.stepProgress[step.id]?.completed).length;
    existing.overallProgress = allSteps.length > 0 ? (completedSteps / allSteps.length) * 100 : 0;
    existing.completed = completedSteps === allSteps.length;
    existing.status = existing.claimed ? 'CLAIMED' : existing.completed ? 'COMPLETED' : 'IN_PROGRESS';

    saveData();
    return existing;
  },

  claimQuestReward: (playerId: string, questId: string): boolean => {
    loadData();
    const progress = inMemoryData.questProgress.find(
      p => p.playerId === playerId && p.questId === questId
    );
    
    if (!progress || !progress.completed || progress.claimed) {
      return false;
    }

    const quest = inMemoryData.quests.find(q => q.id === questId);
    if (!quest) {
      return false;
    }

    const rewardType = quest.reward?.type || quest.rewardType || (quest.rewardPoints && quest.rewardPoints > 0 ? 'points' : undefined);
    if (!rewardType) {
      return false;
    }

    let hasReward = false;

    // Handle Points
    if (rewardType === 'points' || rewardType === 'both') {
      const pointsAmount = quest.reward?.points || quest.rewardPoints || 0;
      if (pointsAmount > 0) {
        let wallet = inMemoryData.wallets.find(w => w.playerId === playerId);
        if (!wallet) {
          wallet = { playerId, rewardPoints: 0 };
          inMemoryData.wallets.push(wallet);
        }
        wallet.rewardPoints += pointsAmount;
        hasReward = true;
      }
    }

    // Handle Bonus
    if (rewardType === 'bonus' || rewardType === 'both') {
      const templateId = quest.reward?.bonusTemplateId;
      if (templateId) {
        const template = inMemoryData.bonusTemplates.find(t => t.id === templateId);
        if (template) {
          const bonus: BonusInstance = {
            id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            playerId,
            achievementId: questId, // kept for compatibility
            templateId: template.id,
            templateName: template.name,
            type: template.type,
            amount: template.defaultAmount,
            wagering: template.defaultWagering,
            status: 'active',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            sourceType: 'quest',
            sourceId: questId,
            wageringRequired: template.defaultWagering,
            wageringProgress: 0,
          };
          inMemoryData.playerBonuses.push(bonus);
          hasReward = true;
        }
      }
    }

    if (!hasReward) {
      return false;
    }

    progress.claimed = true;
    progress.status = 'CLAIMED';
    saveData();
    return true;
  },
};

