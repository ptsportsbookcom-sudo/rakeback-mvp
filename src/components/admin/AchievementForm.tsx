import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/mockApi';
import type {
  Achievement,
  TriggerType,
  VerticalType,
  VerificationType,
  CasinoFilters,
  LiveCasinoFilters,
  SportsbookFilters,
  CrossVerticalFilters,
  RewardType,
  BonusTemplate,
} from '../../types';

export default function AchievementForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Achievement>>({
    title: '',
    description: '',
    trigger: {
      type: 'login_streak',
    },
    vertical: 'casino',
    rewardPoints: 0,
    reward: undefined,
    status: 'active',
    priority: 0,
  });
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);

  useEffect(() => {
    setBonusTemplates(api.getBonusTemplates());
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const achievement = api.getAchievement(id);
      if (achievement) {
        setFormData(achievement);
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      api.updateAchievement(id, formData as Achievement);
    } else {
      api.createAchievement(formData as Omit<Achievement, 'id' | 'createdAt'>);
    }
    navigate('/admin/achievements');
  };

  const updateTrigger = (updates: Partial<Achievement['trigger']>) => {
    setFormData({
      ...formData,
      trigger: { ...formData.trigger!, ...updates },
    });
  };

  const updateFilters = (updates: any) => {
    setFormData({
      ...formData,
      filters: { ...formData.filters, ...updates },
    });
  };

  const renderTriggerFields = () => {
    const trigger = formData.trigger!;
    switch (trigger.type) {
      case 'login_streak':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Days</label>
            <input
              type="number"
              value={trigger.days || ''}
              onChange={(e) => updateTrigger({ days: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        );
      case 'game_turnover':
      case 'game_transaction':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={trigger.quantity || ''}
                onChange={(e) => updateTrigger({ quantity: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Amount</label>
              <input
                type="number"
                step="0.01"
                value={trigger.minimumAmount || ''}
                onChange={(e) => updateTrigger({ minimumAmount: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        );
      case 'deposit':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Deposits</label>
              <input
                type="number"
                value={trigger.numberOfDeposits || ''}
                onChange={(e) => updateTrigger({ numberOfDeposits: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Amount</label>
              <input
                type="number"
                step="0.01"
                value={trigger.depositMinimumAmount || ''}
                onChange={(e) => updateTrigger({ depositMinimumAmount: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        );
      case 'winning_bets_count':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Winning Bets Target (count)</label>
              <input
                type="number"
                value={trigger.winningBetsTarget || ''}
                onChange={(e) => updateTrigger({ winningBetsTarget: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'total_win_amount':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Win Amount Target</label>
              <input
                type="number"
                step="0.01"
                value={trigger.totalWinAmountTarget || ''}
                onChange={(e) => updateTrigger({ totalWinAmountTarget: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'max_single_win':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Single Win Amount</label>
              <input
                type="number"
                step="0.01"
                value={trigger.maxSingleWinMinimum || ''}
                onChange={(e) => updateTrigger({ maxSingleWinMinimum: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'consecutive_wins':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Win Streak Target</label>
              <input
                type="number"
                value={trigger.winStreakTarget || ''}
                onChange={(e) => updateTrigger({ winStreakTarget: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'specific_game_engagement':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Specific Game / Event ID</label>
              <input
                type="text"
                value={trigger.specificGameId || trigger.specificEventId || ''}
                onChange={(e) => updateTrigger({ specificGameId: e.target.value, specificEventId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="game-123 or event-123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Engagement Target (count)</label>
              <input
                type="number"
                value={trigger.specificGameTargetCount || ''}
                onChange={(e) => updateTrigger({ specificGameTargetCount: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'market_specific_bets':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Market Type</label>
              <input
                type="text"
                value={trigger.marketTypeRequired || ''}
                onChange={(e) => updateTrigger({ marketTypeRequired: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Over/Under, Handicap, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity (bets)</label>
              <input
                type="number"
                value={trigger.quantity || ''}
                onChange={(e) => updateTrigger({ quantity: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'total_deposit_amount':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Deposit Amount Target</label>
              <input
                type="number"
                step="0.01"
                value={trigger.totalDepositAmountTarget || ''}
                onChange={(e) => updateTrigger({ totalDepositAmountTarget: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Withdrawal Count Target (optional)</label>
              <input
                type="number"
                value={trigger.withdrawalCountTarget || ''}
                onChange={(e) => updateTrigger({ withdrawalCountTarget: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Withdrawal Amount Target (optional)</label>
              <input
                type="number"
                step="0.01"
                value={trigger.withdrawalAmountTarget || ''}
                onChange={(e) => updateTrigger({ withdrawalAmountTarget: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">If both set, both will be tracked; whichever completes first will finish the achievement.</p>
            </div>
          </div>
        );
      case 'referral_count':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Referral Count Target</label>
              <input
                type="number"
                value={trigger.referralCountTarget || ''}
                onChange={(e) => updateTrigger({ referralCountTarget: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'account_longevity':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Age Target (days)</label>
              <input
                type="number"
                value={trigger.accountAgeDaysTarget || ''}
                onChange={(e) => updateTrigger({ accountAgeDaysTarget: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
          </div>
        );
      case 'profile_completion':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Marks complete when profile is flagged as completed.</p>
          </div>
        );
      case 'net_result':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Net Win Target (optional)</label>
              <input
                type="number"
                step="0.01"
                value={trigger.netWinTarget || ''}
                onChange={(e) => updateTrigger({ netWinTarget: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Positive value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Net Loss Target (optional)</label>
              <input
                type="number"
                step="0.01"
                value={trigger.netLossTarget || ''}
                onChange={(e) => updateTrigger({ netLossTarget: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Negative value"
              />
              <p className="text-xs text-gray-500 mt-1">If both set, whichever threshold is hit first completes the achievement.</p>
            </div>
          </div>
        );
      case 'user_verification':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Type</label>
            <select
              value={trigger.verificationType || 'email'}
              onChange={(e) => updateTrigger({ verificationType: e.target.value as VerificationType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="kyc">KYC</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const renderVerticalFilters = () => {
    const vertical = formData.vertical!;
    switch (vertical) {
      case 'casino':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Providers (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as CasinoFilters)?.providers?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    providers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Pragmatic Play, Evolution, NetEnt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Game Categories (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as CasinoFilters)?.gameCategories?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    gameCategories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Slots, Live, Table, Crash"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Individual Games (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as CasinoFilters)?.games?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    games: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Game 1, Game 2"
              />
            </div>
          </div>
        );
      case 'live_casino':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Providers (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as LiveCasinoFilters)?.providers?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    providers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Game Types (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as LiveCasinoFilters)?.gameTypes?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    gameTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Individual Games (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as LiveCasinoFilters)?.games?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    games: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        );
      case 'sportsbook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sport Types (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as SportsbookFilters)?.sportTypes?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    sportTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Football, Basketball, Tennis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Countries (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as SportsbookFilters)?.countries?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    countries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Leagues (comma-separated)</label>
              <input
                type="text"
                value={(formData.filters as SportsbookFilters)?.leagues?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    leagues: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Events (comma-separated, optional)</label>
              <input
                type="text"
                value={(formData.filters as SportsbookFilters)?.events?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    events: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Market Types (comma-separated, optional)</label>
              <input
                type="text"
                value={(formData.filters as SportsbookFilters)?.marketTypes?.join(', ') || ''}
                onChange={(e) =>
                  updateFilters({
                    marketTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        );
      case 'cross_vertical':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Casino Filters</h3>
              <div className="space-y-4 pl-4 border-l-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Providers</label>
                  <input
                    type="text"
                    value={(formData.filters as CrossVerticalFilters)?.casino?.providers?.join(', ') || ''}
                    onChange={(e) =>
                      updateFilters({
                        casino: {
                          ...((formData.filters as CrossVerticalFilters)?.casino || {}),
                          providers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Game Categories</label>
                  <input
                    type="text"
                    value={(formData.filters as CrossVerticalFilters)?.casino?.gameCategories?.join(', ') || ''}
                    onChange={(e) =>
                      updateFilters({
                        casino: {
                          ...((formData.filters as CrossVerticalFilters)?.casino || {}),
                          gameCategories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Sports Filters</h3>
              <div className="space-y-4 pl-4 border-l-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sport Types</label>
                  <input
                    type="text"
                    value={(formData.filters as CrossVerticalFilters)?.sports?.sportTypes?.join(', ') || ''}
                    onChange={(e) =>
                      updateFilters({
                        sports: {
                          ...((formData.filters as CrossVerticalFilters)?.sports || {}),
                          sportTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Countries</label>
                  <input
                    type="text"
                    value={(formData.filters as CrossVerticalFilters)?.sports?.countries?.join(', ') || ''}
                    onChange={(e) =>
                      updateFilters({
                        sports: {
                          ...((formData.filters as CrossVerticalFilters)?.sports || {}),
                          countries: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const gameDependentTriggers: TriggerType[] = [
    'game_turnover',
    'game_transaction',
    'winning_bets_count',
    'total_win_amount',
    'max_single_win',
    'consecutive_wins',
    'specific_game_engagement',
    'market_specific_bets',
  ];

  const showVerticalScope = formData.trigger?.type
    ? gameDependentTriggers.includes(formData.trigger.type)
    : false;

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Achievement' : 'Create Achievement'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        {/* Trigger Configuration */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium">Trigger Configuration</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trigger Type *</label>
            <select
              value={formData.trigger?.type || 'login_streak'}
              onChange={(e) => updateTrigger({ type: e.target.value as TriggerType })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="login_streak">Login Streak</option>
              <option value="game_turnover">Game Turnover</option>
              <option value="game_transaction">Game Transaction</option>
              <option value="user_verification">User Verification</option>
              <option value="deposit">Deposit</option>
              <option value="winning_bets_count">Winning Bets Count</option>
              <option value="total_win_amount">Total Win Amount</option>
              <option value="max_single_win">Max Single Win</option>
              <option value="consecutive_wins">Consecutive Wins</option>
              <option value="specific_game_engagement">Specific Game Engagement</option>
              <option value="market_specific_bets">Market-Specific Sports Bets</option>
              <option value="total_deposit_amount">Total Deposit Amount</option>
              <option value="withdrawal">Withdrawal Count / Amount</option>
              <option value="referral_count">Referral Count</option>
              <option value="account_longevity">Account Longevity</option>
              <option value="profile_completion">Profile Completion</option>
              <option value="net_result">Net Loss / Net Win</option>
            </select>
          </div>
          {renderTriggerFields()}
        </div>

        {/* Vertical Scope — only relevant for Game Turnover / Game Transaction */}
        {showVerticalScope && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vertical Scope *</h3>
              <span className="text-xs text-gray-500">
                Visible only for Game Turnover / Game Transaction
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vertical</label>
              <select
                value={formData.vertical || 'casino'}
                onChange={(e) => {
                  setFormData({ ...formData, vertical: e.target.value as VerticalType, filters: undefined });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="casino">Casino</option>
                <option value="sportsbook">Sportsbook</option>
                <option value="live_casino">Live Casino</option>
                <option value="cross_vertical">Cross-Vertical</option>
              </select>
            </div>
            {renderVerticalFilters()}
          </div>
        )}

        {/* Reward Configuration */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium">Reward Configuration</h3>
          
          {/* Reward Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type *</label>
            <select
              value={formData.reward?.type || (formData.rewardPoints && formData.rewardPoints > 0 ? 'points' : '')}
              onChange={(e) => {
                const rewardType = e.target.value as RewardType | '';
                if (!rewardType) {
                  setFormData({
                    ...formData,
                    reward: undefined,
                    rewardPoints: 0,
                  });
                } else {
                  setFormData({
                    ...formData,
                    reward: {
                      type: rewardType,
                      points: formData.reward?.points || formData.rewardPoints || 0,
                      bonusTemplateId: formData.reward?.bonusTemplateId,
                    },
                    // Keep backward compatibility
                    rewardPoints: rewardType === 'points' || rewardType === 'both' 
                      ? (formData.reward?.points || formData.rewardPoints || 0)
                      : 0,
                  });
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">No Reward</option>
              <option value="points">Points Only</option>
              <option value="bonus">Bonus Only</option>
              <option value="both">Both Points & Bonus</option>
            </select>
          </div>

          {/* Points Configuration */}
          {(formData.reward?.type === 'points' || formData.reward?.type === 'both' || 
            (!formData.reward && formData.rewardPoints && formData.rewardPoints > 0)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Points Amount *</label>
              <input
                type="number"
                value={formData.reward?.points || formData.rewardPoints || 0}
                onChange={(e) => {
                  const points = parseInt(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    reward: formData.reward ? { ...formData.reward, points } : { type: 'points', points },
                    rewardPoints: points, // backward compatibility
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
                min="1"
              />
            </div>
          )}

          {/* Bonus Configuration */}
          {(formData.reward?.type === 'bonus' || formData.reward?.type === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Bonus Template *</label>
              <select
                value={formData.reward?.bonusTemplateId || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    reward: {
                      ...formData.reward!,
                      bonusTemplateId: e.target.value,
                    },
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="">Select Bonus Template</option>
                {bonusTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type === 'freebet' ? 'Free Bet' : template.type === 'freespins' ? 'Free Spins' : 'Cash Bonus'})
                  </option>
                ))}
              </select>
              {formData.reward?.bonusTemplateId && (
                <div className="mt-2 text-sm text-gray-600">
                  {(() => {
                    const template = bonusTemplates.find(t => t.id === formData.reward?.bonusTemplateId);
                    return template ? (
                      <div>
                        <div>Type: {template.type}</div>
                        <div>Amount: {template.defaultAmount}</div>
                        {template.defaultWagering && <div>Wagering: {template.defaultWagering}x</div>}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium">Metadata</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status *</label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <input
              type="number"
              value={formData.priority || 0}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/achievements')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

