import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/mockApi';
import type { Achievement, PlayerAchievementProgress } from '../../types';

const DEFAULT_PLAYER_ID = 'player-1';

type FilterType = 'all' | 'in_progress' | 'completed';

export default function AchievementsLobby() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Record<string, PlayerAchievementProgress>>({});
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const activeAchievements = api.getAchievements().filter(a => a.status === 'active');
    setAchievements(activeAchievements);

    const playerProgress = api.getPlayerAchievements(DEFAULT_PLAYER_ID);
    const progressMap: Record<string, PlayerAchievementProgress> = {};
    playerProgress.forEach(p => {
      progressMap[p.achievementId] = p;
    });
    setProgress(progressMap);
  };

  const getAchievementState = (achievementId: string): 'locked' | 'in_progress' | 'completed' => {
    const prog = progress[achievementId];
    if (!prog) return 'locked';
    // Use explicit status if available, fallback to boolean flags
    const status = prog.status || (prog.claimed ? 'CLAIMED' : prog.completed ? 'COMPLETED' : 'IN_PROGRESS');
    if (status === 'CLAIMED' || status === 'COMPLETED') return 'completed';
    if (status === 'IN_PROGRESS') return 'in_progress';
    return 'locked';
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    const state = getAchievementState(achievement.id);
    if (filter === 'in_progress') return state === 'in_progress';
    if (filter === 'completed') return state === 'completed';
    return true;
  });

  const formatTriggerDescription = (achievement: Achievement): string => {
    const trigger = achievement.trigger;
    const vertical = achievement.vertical;

    let desc = '';
    switch (trigger.type) {
      case 'login_streak':
        desc = `Login for ${trigger.days} consecutive days`;
        break;
      case 'game_turnover':
        desc = `Generate ${trigger.quantity || 'N/A'} turnover`;
        if (trigger.minimumAmount) desc += ` (min ${trigger.minimumAmount})`;
        break;
      case 'game_transaction':
        desc = `Complete ${trigger.quantity || 'N/A'} game transactions`;
        break;
      case 'deposit':
        desc = `Make ${trigger.numberOfDeposits || 'N/A'} deposits`;
        if (trigger.depositMinimumAmount) desc += ` (min ${trigger.depositMinimumAmount})`;
        break;
      case 'user_verification':
        desc = `Verify your ${trigger.verificationType}`;
        break;
    }

    if (vertical === 'casino' || vertical === 'live_casino') {
      desc += ' in Casino';
    } else if (vertical === 'sportsbook') {
      desc += ' in Sportsbook';
    } else if (vertical === 'cross_vertical') {
      desc += ' across all verticals';
    }

    return desc;
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className="text-4xl font-bold neon-gold mb-6 md:mb-0">🏆 Achievements</h2>
        
        {/* Casino-style segmented tabs */}
        <div className="flex glass-card rounded-xl p-1 border border-cyan-500/20">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                : 'text-gray-300 hover:text-cyan-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              filter === 'in_progress'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                : 'text-gray-300 hover:text-cyan-400'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                : 'text-gray-300 hover:text-cyan-400'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const state = getAchievementState(achievement.id);
          const prog = progress[achievement.id];
          const hasReward = !!achievement.rewardPoints && achievement.rewardPoints > 0;

          return (
            <Link
              key={achievement.id}
              to={`/player/achievement/${achievement.id}`}
              className={`glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 ${
                state === 'locked' ? 'opacity-50' : ''
              } ${
                state === 'completed' ? 'glow-gold border-2 border-yellow-500/50' : 'border border-white/10'
              }`}
            >
              {/* Badge Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                  state === 'completed' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 glow-gold' :
                  state === 'in_progress' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 glow-cyan' :
                  'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                  {achievement.icon ? (
                    <img src={achievement.icon} alt={achievement.title} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>🏆</span>
                  )}
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{achievement.description}</p>
                <p className="text-xs text-cyan-400 mb-4">{formatTriggerDescription(achievement)}</p>
              </div>

              {/* Reward Badge */}
              {(() => {
                const rewardType = achievement.reward?.type || (achievement.rewardPoints && achievement.rewardPoints > 0 ? 'points' : undefined);
                if (!rewardType) return null;
                
                const parts: JSX.Element[] = [];
                if (rewardType === 'points' || rewardType === 'both') {
                  const points = achievement.reward?.points || achievement.rewardPoints || 0;
                  if (points > 0) {
                    parts.push(
                      <div key="points" className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 rounded-full flex items-center space-x-2 glow-gold">
                        <span className="text-lg">🪙</span>
                        <span className="font-bold text-white">{points} RP</span>
                      </div>
                    );
                  }
                }
                if (rewardType === 'bonus' || rewardType === 'both') {
                  if (achievement.reward?.bonusTemplateId) {
                    const template = api.getBonusTemplate(achievement.reward.bonusTemplateId);
                    if (template) {
                      const typeIcons: Record<string, string> = { freebet: '🎯', freespins: '🎰', cash: '💰' };
                      parts.push(
                        <div key="bonus" className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full flex items-center space-x-2 glow-cyan">
                          <span className="text-lg">{typeIcons[template.type] || '🎁'}</span>
                          <span className="font-bold text-white">{template.name}</span>
                        </div>
                      );
                    }
                  }
                }
                return parts.length > 0 ? (
                  <div className="flex justify-center gap-2 mb-4 flex-wrap">
                    {parts}
                  </div>
                ) : null;
              })()}

              {/* Progress Bar */}
              {state !== 'locked' && prog && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Progress</span>
                    <span className="neon-cyan">{Math.round(prog.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        state === 'completed'
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 glow-gold'
                          : 'bg-gradient-to-r from-cyan-400 to-purple-500 glow-cyan'
                      }`}
                      style={{ width: `${prog.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    {prog.currentValue} / {prog.targetValue}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex justify-center">
                <span
                  className={`px-4 py-2 rounded-full text-xs font-bold ${
                    state === 'completed'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white glow-gold'
                      : state === 'in_progress'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {state === 'completed'
                    ? '✓ Completed'
                    : state === 'in_progress'
                    ? '⏳ In Progress'
                    : '🔒 Locked'}
                </span>
              </div>

              {/* Claim Available Indicator */}
              {hasReward && state === 'completed' && prog && !prog.claimed && (
                <div className="mt-3 text-center">
                  <span className="text-xs neon-gold animate-pulse">✨ Claim Available!</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎰</div>
          <div className="text-xl text-gray-400">No achievements found for this filter.</div>
        </div>
      )}

      <SimulationControls onAction={() => loadData()} />
    </div>
  );
}

function SimulationControls({ onAction }: { onAction: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [simulationType, setSimulationType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [vertical, setVertical] = useState<string>('casino');
  const [verificationType, setVerificationType] = useState<string>('email');

  // New simulation fields
  const [isWin, setIsWin] = useState<boolean>(true);
  void isWin;
  const [winAmount, setWinAmount] = useState<string>('');
  const [marketType, setMarketType] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');
  const [sportType, setSportType] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [league, setLeague] = useState<string>('');
  const [eventId, setEventId] = useState<string>('');
  const [isWithdrawal, setIsWithdrawal] = useState<boolean>(false);
  void isWithdrawal;
  const [referrals, setReferrals] = useState<string>('1');
  const [accountAgeDays, setAccountAgeDays] = useState<string>('30');
  const [profileCompleted, setProfileCompleted] = useState<boolean>(true);
  const [netDelta, setNetDelta] = useState<string>('');
  const [winLossResult, setWinLossResult] = useState<'win' | 'loss'>('win');

  const openModal = (type: string, preset?: Partial<{ vertical: string; isWin: boolean; isWithdrawal: boolean }>) => {
    setSimulationType(type);
    if (preset?.vertical) setVertical(preset.vertical);
    if (preset?.isWin !== undefined) setIsWin(preset.isWin);
    if (preset?.isWithdrawal !== undefined) setIsWithdrawal(preset.isWithdrawal);
    setShowModal(true);
  };

  const resetFields = () => {
    setAmount('');
    setWinAmount('');
    setMarketType('');
    setProvider('');
    setCategory('');
    setGameId('');
    setSportType('');
    setCountry('');
    setLeague('');
    setEventId('');
    setIsWithdrawal(false);
    setReferrals('1');
    setAccountAgeDays('30');
    setProfileCompleted(true);
    setNetDelta('');
    setWinLossResult('win');
    setIsWin(true);
  };

  const handleSimulate = () => {
    const action: any = {
      type: simulationType,
      vertical: vertical !== 'any' ? vertical : undefined,
    };

    // Common filters/metadata
    if (provider) action.provider = provider;
    if (category) action.category = category;
    if (gameId) action.gameId = gameId;
    if (sportType) action.sportType = sportType;
    if (country) action.country = country;
    if (league) action.league = league;
    if (eventId) action.eventId = eventId;
    if (marketType) action.marketType = marketType;

    // Existing metrics
    if (simulationType === 'game_turnover' || simulationType === 'game_transaction' || simulationType === 'deposit') {
      action.amount = parseFloat(amount) || 0;
    }
    if (simulationType === 'user_verification') {
      action.verificationType = verificationType;
    }

    // New game-dependent metrics
    if (simulationType === 'winning_bets_count') {
      action.isWin = true;
      action.winAmount = parseFloat(winAmount) || 0;
    }
    if (simulationType === 'total_win_amount') {
      action.isWin = true;
      action.winAmount = parseFloat(winAmount) || 0;
    }
    if (simulationType === 'max_single_win') {
      action.isWin = true;
      action.winAmount = parseFloat(winAmount) || 0;
    }
    if (simulationType === 'consecutive_wins') {
      action.isWin = winLossResult === 'win';
      action.winAmount = action.isWin ? parseFloat(winAmount) || 0 : 0;
    }
    if (simulationType === 'specific_game_engagement') {
      // Each simulate counts as one engagement; use gameId/eventId set in form
    }
    if (simulationType === 'market_specific_bets') {
      action.amount = parseFloat(amount) || 0;
    }

    // New non-game metrics
    if (simulationType === 'total_deposit_amount') {
      action.amount = parseFloat(amount) || 0;
    }
    if (simulationType === 'withdrawal') {
      action.isWithdrawal = true;
      action.amount = parseFloat(amount) || 0;
    }
    if (simulationType === 'referral_count') {
      action.referrals = parseInt(referrals) || 1;
    }
    if (simulationType === 'account_longevity') {
      action.accountAgeDays = parseInt(accountAgeDays) || 0;
    }
    if (simulationType === 'profile_completion') {
      action.profileCompleted = profileCompleted;
    }
    if (simulationType === 'net_result') {
      action.netDelta = parseFloat(netDelta) || 0;
    }

    api.simulateAction(DEFAULT_PLAYER_ID, action);
    setShowModal(false);
    resetFields();
    onAction();
  };

  const isGameDependent = [
    'game_turnover',
    'game_transaction',
    'winning_bets_count',
    'total_win_amount',
    'max_single_win',
    'consecutive_wins',
    'specific_game_engagement',
    'market_specific_bets',
  ].includes(simulationType);

  return (
    <div className="mt-12 glass-card rounded-2xl p-6 border border-cyan-500/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-xl font-bold neon-cyan flex items-center">
          <span className="mr-2">⚙️</span>
          Developer Tools
        </h3>
        <span className="text-cyan-400 text-2xl transform transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Existing */}
          <button onClick={() => openModal('login_streak')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">🔐 Login</button>
          <button onClick={() => openModal('game_turnover', { vertical: 'casino' })} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">🎰 Casino Turnover</button>
          <button onClick={() => openModal('game_transaction', { vertical: 'sportsbook' })} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">⚽ Sports Transaction</button>
          <button onClick={() => openModal('deposit')} className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">💳 Deposit</button>
          <button onClick={() => openModal('user_verification')} className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">✅ Verification</button>

          {/* New game-dependent */}
          <button onClick={() => openModal('winning_bets_count', { isWin: true })} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">🏆 Winning Bets</button>
          <button onClick={() => openModal('total_win_amount', { isWin: true })} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">💰 Total Win Amount</button>
          <button onClick={() => openModal('max_single_win', { isWin: true })} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">💎 Max Single Win</button>
          <button onClick={() => openModal('consecutive_wins', { isWin: true })} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">🔥 Win Streak</button>
          <button onClick={() => openModal('specific_game_engagement')} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">🎮 Specific Game</button>
          <button onClick={() => openModal('market_specific_bets')} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">📈 Market Bet</button>

          {/* New non-game */}
          <button onClick={() => openModal('total_deposit_amount')} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">💳 Total Deposit</button>
          <button onClick={() => openModal('withdrawal', { isWithdrawal: true })} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">🏧 Withdrawal</button>
          <button onClick={() => openModal('referral_count')} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">👥 Referrals</button>
          <button onClick={() => openModal('account_longevity')} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">⏳ Account Age</button>
          <button onClick={() => openModal('profile_completion')} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">🧩 Profile Complete</button>
          <button onClick={() => openModal('net_result')} className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">⚖️ Net Result</button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="glass-card rounded-2xl p-8 max-w-xl w-full mx-4 border border-cyan-500/30 glow-cyan" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold neon-cyan mb-6">🎮 Simulate Action</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Action Type</label>
                <div className="text-lg text-cyan-400 font-semibold">{simulationType.replace('_', ' ').toUpperCase()}</div>
              </div>

              {isGameDependent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Vertical</label>
                    <select
                      value={vertical}
                      onChange={(e) => setVertical(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="casino">Casino</option>
                      <option value="sportsbook">Sportsbook</option>
                      <option value="live_casino">Live Casino</option>
                      <option value="cross_vertical">Cross Vertical</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                    <input
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g. Pragmatic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Slots / Table / etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Game ID</label>
                    <input
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="game-123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sport Type</label>
                    <input
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Football"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="England"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">League</label>
                    <input
                      value={league}
                      onChange={(e) => setLeague(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Premier League"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Event ID</label>
                    <input
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="event-123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Market Type</label>
                    <input
                      value={marketType}
                      onChange={(e) => setMarketType(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="Over/Under"
                    />
                  </div>
                </div>
              )}

              {/* Amounts for relevant actions */}
              {(simulationType === 'game_turnover' ||
                simulationType === 'game_transaction' ||
                simulationType === 'deposit' ||
                simulationType === 'total_deposit_amount' ||
                simulationType === 'withdrawal' ||
                simulationType === 'market_specific_bets') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>
              )}

              {/* Win-related */}
              {(simulationType === 'winning_bets_count' ||
                simulationType === 'total_win_amount' ||
                simulationType === 'max_single_win' ||
                simulationType === 'consecutive_wins') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {simulationType === 'consecutive_wins' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Result</label>
                      <select
                        value={winLossResult}
                        onChange={(e) => setWinLossResult(e.target.value as 'win' | 'loss')}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="win">Win</option>
                        <option value="loss">Loss (resets streak)</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Win Amount (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={winAmount}
                      onChange={(e) => setWinAmount(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g. 25"
                    />
                  </div>
                </div>
              )}

              {/* Specific game engagement */}
              {simulationType === 'specific_game_engagement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Specific Game / Event ID</label>
                  <input
                    value={gameId || eventId}
                    onChange={(e) => {
                      setGameId(e.target.value);
                      setEventId(e.target.value);
                    }}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="game-123 or event-123"
                  />
                </div>
              )}

              {/* Verification */}
              {simulationType === 'user_verification' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Verification Type</label>
                  <select
                    value={verificationType}
                    onChange={(e) => setVerificationType(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="kyc">KYC</option>
                  </select>
                </div>
              )}

              {/* Referral count */}
              {simulationType === 'referral_count' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Referrals to add</label>
                  <input
                    type="number"
                    value={referrals}
                    onChange={(e) => setReferrals(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. 1"
                  />
                </div>
              )}

              {/* Account longevity */}
              {simulationType === 'account_longevity' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Age (days)</label>
                  <input
                    type="number"
                    value={accountAgeDays}
                    onChange={(e) => setAccountAgeDays(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. 90"
                  />
                </div>
              )}

              {/* Profile completion */}
              {simulationType === 'profile_completion' && (
                <div className="flex items-center space-x-3">
                  <input
                    id="profileCompleted"
                    type="checkbox"
                    checked={profileCompleted}
                    onChange={(e) => setProfileCompleted(e.target.checked)}
                    className="h-4 w-4 text-cyan-500 border-gray-300 rounded"
                  />
                  <label htmlFor="profileCompleted" className="text-sm text-gray-300">Mark profile as completed</label>
                </div>
              )}

              {/* Net result */}
              {simulationType === 'net_result' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Net Delta (positive = win, negative = loss)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={netDelta}
                    onChange={(e) => setNetDelta(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g. 50 or -50"
                  />
                </div>
              )}

              {/* Withdrawal toggle (info) */}
              {simulationType === 'withdrawal' && (
                <div className="text-xs text-gray-400">This action will be treated as a withdrawal event.</div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetFields();
                  }}
                  className="px-6 py-2 glass-card border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSimulate}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 font-semibold glow-cyan"
                >
                  🚀 Simulate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
