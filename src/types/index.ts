export type TriggerType = 
  | 'login_streak'
  | 'game_turnover'
  | 'game_transaction'
  | 'user_verification'
  | 'deposit'
  // New game-dependent metrics
  | 'winning_bets_count'
  | 'total_win_amount'
  | 'max_single_win'
  | 'consecutive_wins'
  | 'specific_game_engagement'
  | 'market_specific_bets'
  // New non-game-dependent metrics
  | 'total_deposit_amount'
  | 'withdrawal'
  | 'referral_count'
  | 'account_longevity'
  | 'profile_completion'
  | 'net_result';

export type VerticalType = 
  | 'casino'
  | 'sportsbook'
  | 'live_casino'
  | 'cross_vertical';

export type VerificationType = 'email' | 'phone' | 'kyc';

export type AchievementStatus = 'active' | 'inactive';

export type TransactionStatus = 'completed' | 'claimed';

export interface CasinoFilters {
  providers?: string[];
  gameCategories?: string[];
  games?: string[];
}

export interface LiveCasinoFilters {
  providers?: string[];
  gameTypes?: string[];
  games?: string[];
}

export interface SportsbookFilters {
  sportTypes?: string[];
  countries?: string[];
  leagues?: string[];
  events?: string[];
  marketTypes?: string[];
}

export interface CrossVerticalFilters {
  casino?: CasinoFilters;
  sports?: SportsbookFilters;
}

export interface TriggerConfig {
  type: TriggerType;
  // Login Streak
  days?: number;
  // Turnover / Transaction
  quantity?: number;
  minimumAmount?: number;
  // Deposit
  numberOfDeposits?: number;
  depositMinimumAmount?: number;
  // User Verification
  verificationType?: VerificationType;
  // Game-dependent metrics
  winningBetsTarget?: number;
  totalWinAmountTarget?: number;
  maxSingleWinMinimum?: number;
  winStreakTarget?: number;
  specificGameId?: string;
  specificEventId?: string;
  specificGameTargetCount?: number;
  marketTypeRequired?: string;
  // Non-game-dependent metrics
  totalDepositAmountTarget?: number;
  withdrawalCountTarget?: number;
  withdrawalAmountTarget?: number;
  referralCountTarget?: number;
  accountAgeDaysTarget?: number;
  profileCompletionRequired?: boolean;
  netWinTarget?: number;
  netLossTarget?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  trigger: TriggerConfig;
  vertical: VerticalType;
  filters?: CasinoFilters | LiveCasinoFilters | SportsbookFilters | CrossVerticalFilters;
  rewardPoints?: number; // kept for backward compatibility
  reward?: AchievementReward; // new reward configuration
  status: AchievementStatus;
  priority: number;
  icon?: string; // base64 or URL
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  email: string;
}

export type AchievementProgressStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';

export interface PlayerAchievementProgress {
  playerId: string;
  achievementId: string;
  progress: number; // 0-100
  currentValue: number; // current progress value
  targetValue: number; // target value
  lastUpdate: string;
  completed: boolean; // kept for backward compatibility
  claimed: boolean; // kept for backward compatibility
  status?: AchievementProgressStatus; // explicit status tracking
}

export interface TransactionLog {
  id: string;
  playerId: string;
  achievementId: string;
  triggerType: TriggerType;
  vertical: VerticalType;
  rewardPoints: number; // kept for backward compatibility
  bonusGranted?: boolean; // new field
  timestamp: string;
  status: TransactionStatus;
}

export interface PlayerWallet {
  playerId: string;
  rewardPoints: number;
}

// Bonus System Types
export type BonusType = 'freebet' | 'freespins' | 'cash';

export type RewardType = 'points' | 'bonus' | 'both';

export interface BonusTemplate {
  id: string;
  name: string;
  type: BonusType;
  defaultAmount: number;
  defaultWagering?: number;
}

export type BonusStatus = 'active' | 'used' | 'expired';

export interface PlayerBonus {
  id: string;
  playerId: string;
  achievementId: string;
  templateId: string;
  templateName: string;
  type: BonusType;
  amount: number;
  wagering?: number;
  status: BonusStatus;
  createdAt: string;
  expiresAt?: string;
}

export interface AchievementReward {
  type: RewardType;
  points?: number;
  bonusTemplateId?: string;
}

// Challenges System
export type ChallengeFrequency = 'daily' | 'weekly' | 'monthly';

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  trigger: TriggerConfig;
  vertical?: VerticalType; // optional for challenges
  filters?: CasinoFilters | LiveCasinoFilters | SportsbookFilters | CrossVerticalFilters;
  frequency: ChallengeFrequency;
  startDate: string;
  endDate?: string;
  autoReset: boolean;
  rewardType: RewardType;
  rewardPoints?: number; // kept for backward compatibility
  reward?: AchievementReward; // new reward configuration
  status: AchievementStatus;
  priority: number;
  createdAt: string;
}

export interface PlayerChallengeProgress {
  playerId: string;
  challengeId: string;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  lastUpdate: string;
  completed: boolean;
  claimed: boolean;
  status?: AchievementProgressStatus;
  cycleStartDate: string; // when current cycle started
  cycleEndDate: string; // when current cycle ends
}

// Quests System
export interface QuestStep {
  id: string;
  title: string;
  description?: string;
  trigger: TriggerConfig;
  targetValue: number; // kept for backward compatibility
  order: number;
  // NEW - optional fields for deposit and turnover conditions
  count?: number;     // deposit count
  amount?: number;    // deposit amount OR turnover amount
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  steps: QuestStep[];
  rewardType: RewardType;
  rewardPoints?: number; // kept for backward compatibility
  reward?: AchievementReward; // new reward configuration
  status: AchievementStatus;
  priority: number;
  createdAt: string;
}

export interface PlayerQuestProgress {
  playerId: string;
  questId: string;
  stepProgress: Record<string, {
    progress: number; // 0-100
    currentValue: number;
    targetValue: number;
    completed: boolean;
    lastUpdate: string;
  }>;
  overallProgress: number; // 0-100 (average of all steps)
  completed: boolean;
  claimed: boolean;
  status?: AchievementProgressStatus;
  lastUpdate: string;
}

// Extended Bonus Instance
export type BonusSourceType = 'achievement' | 'challenge' | 'quest';

export interface BonusInstance extends PlayerBonus {
  sourceType: BonusSourceType;
  sourceId: string;
  wageringRequired?: number;
  wageringProgress?: number;
}

