import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/mockApi';
import type { Achievement, PlayerAchievementProgress } from '../../types';

const DEFAULT_PLAYER_ID = 'player-1';

export default function AchievementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [progress, setProgress] = useState<PlayerAchievementProgress | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [rewardParticles, setRewardParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = () => {
    if (!id) return;
    const ach = api.getAchievement(id);
    setAchievement(ach || null);

    const prog = api.getPlayerAchievement(DEFAULT_PLAYER_ID, id);
    setProgress(prog || null);
  };

  const handleClaim = () => {
    if (!id) return;
    setClaiming(true);
    const success = api.claimReward(DEFAULT_PLAYER_ID, id);
    setClaiming(false);
    if (success) {
      setShowClaimModal(false);
      
      // Create reward particles animation
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setRewardParticles(particles);
      setShowSuccessAnimation(true);
      
      loadData();
      window.dispatchEvent(new Event('wallet-update'));
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setRewardParticles([]);
      }, 3000);
    } else {
      alert('Failed to claim reward. Make sure the achievement is completed and not already claimed.');
    }
  };

  if (!achievement) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🎰</div>
          <div className="text-xl">Achievement not found.</div>
        </div>
      </div>
    );
  }

  const formatTriggerDescription = (): string => {
    const trigger = achievement.trigger;
    const vertical = achievement.vertical;

    let desc = '';
    switch (trigger.type) {
      case 'login_streak':
        desc = `Login for ${trigger.days} consecutive days`;
        break;
      case 'game_turnover':
        desc = `Generate ${trigger.quantity || 'N/A'} turnover`;
        if (trigger.minimumAmount) desc += ` (minimum ${trigger.minimumAmount})`;
        break;
      case 'game_transaction':
        desc = `Complete ${trigger.quantity || 'N/A'} game transactions`;
        if (trigger.minimumAmount) desc += ` (minimum ${trigger.minimumAmount} per transaction)`;
        break;
      case 'deposit':
        desc = `Make ${trigger.numberOfDeposits || 'N/A'} deposits`;
        if (trigger.depositMinimumAmount) desc += ` (minimum ${trigger.depositMinimumAmount} per deposit)`;
        break;
      case 'user_verification':
        desc = `Verify your ${trigger.verificationType}`;
        break;
    }

    if (vertical === 'casino' || vertical === 'live_casino') {
      desc += ' in Casino';
      if (achievement.filters) {
        const filters = achievement.filters as any;
        if (filters.providers?.length) {
          desc += ` (Providers: ${filters.providers.join(', ')})`;
        }
        if (filters.gameCategories?.length) {
          desc += ` (Categories: ${filters.gameCategories.join(', ')})`;
        }
      }
    } else if (vertical === 'sportsbook') {
      desc += ' in Sportsbook';
      if (achievement.filters) {
        const filters = achievement.filters as any;
        if (filters.sportTypes?.length) {
          desc += ` (Sports: ${filters.sportTypes.join(', ')})`;
        }
        if (filters.leagues?.length) {
          desc += ` (Leagues: ${filters.leagues.join(', ')})`;
        }
      }
    } else if (vertical === 'cross_vertical') {
      desc += ' across all verticals';
    }

    return desc;
  };

  // Use explicit status if available, fallback to boolean flags for backward compatibility
  const status = progress?.status || (progress?.claimed ? 'CLAIMED' : progress?.completed ? 'COMPLETED' : 'IN_PROGRESS');
  const isCompleted = status === 'COMPLETED' || progress?.completed || false;
  const isClaimed = status === 'CLAIMED' || progress?.claimed || false;
  const rewardType = achievement.reward?.type || (achievement.rewardPoints && achievement.rewardPoints > 0 ? 'points' : undefined);
  const hasReward = !!rewardType && (
    (rewardType === 'points' || rewardType === 'both') && (achievement.reward?.points || achievement.rewardPoints || 0) > 0 ||
    (rewardType === 'bonus' || rewardType === 'both') && !!achievement.reward?.bonusTemplateId
  );
  // Claim button ONLY shows when status is COMPLETED (not IN_PROGRESS, not CLAIMED)
  const canClaim = status === 'COMPLETED' && !isClaimed && hasReward;

  return (
    <div className="px-4 py-6 sm:px-0">
      <button
        onClick={() => navigate('/player')}
        className="mb-6 glass-card px-6 py-3 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:bg-white/10 border border-cyan-500/20"
      >
        ← Back to Achievements
      </button>

      {/* Full-screen modal style card */}
      <div className="glass-card rounded-3xl p-8 md:p-12 border-2 border-cyan-500/30 relative overflow-hidden">
        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce" style={{ animation: 'reward-burst 1s ease-out' }}>
                🎉
              </div>
              <div className="text-4xl font-bold neon-gold mb-2">Reward Claimed!</div>
              <div className="text-2xl neon-cyan">+{achievement.rewardPoints} RP</div>
            </div>
            {rewardParticles.map((particle) => (
              <div
                key={particle.id}
                className="absolute text-2xl"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animation: `reward-burst 3s ease-out forwards`,
                  animationDelay: `${particle.id * 0.1}s`,
                }}
              >
                🪙
              </div>
            ))}
          </div>
        )}

        {/* Badge and Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-6xl md:text-7xl ${
            isClaimed
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 glow-gold animate-pulse'
              : isCompleted
              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 glow-gold'
              : progress
              ? 'bg-gradient-to-br from-cyan-400 to-purple-500 glow-cyan'
              : 'bg-gradient-to-br from-gray-600 to-gray-800'
          }`}>
            {achievement.icon ? (
              <img src={achievement.icon} alt={achievement.title} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>🏆</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{achievement.title}</h1>
            <p className="text-lg text-gray-300 mb-6">{achievement.description}</p>
            <div className="flex flex-wrap gap-3">
              {(() => {
                const rewardType = achievement.reward?.type || (achievement.rewardPoints && achievement.rewardPoints > 0 ? 'points' : undefined);
                const points = achievement.reward?.points || achievement.rewardPoints || 0;
                const bonusTemplateId = achievement.reward?.bonusTemplateId;
                
                if (!rewardType) {
                  return (
                    <div className="inline-flex items-center glass-card px-4 py-2 rounded-full border border-gray-700 text-gray-300">
                      <span className="text-lg mr-2">ℹ️</span>
                      <span className="text-sm">No reward configured</span>
                    </div>
                  );
                }
                
                return (
                  <>
                    {(rewardType === 'points' || rewardType === 'both') && points > 0 && (
                      <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3 rounded-full glow-gold">
                        <span className="text-2xl mr-2">🪙</span>
                        <span className="text-xl font-bold text-white">{points} Reward Points</span>
                      </div>
                    )}
                    {(rewardType === 'bonus' || rewardType === 'both') && bonusTemplateId && (() => {
                      const template = api.getBonusTemplate(bonusTemplateId);
                      if (!template) return null;
                      const typeLabels: Record<string, { label: string; icon: string }> = {
                        freebet: { label: 'Free Bet', icon: '🎯' },
                        freespins: { label: 'Free Spins', icon: '🎰' },
                        cash: { label: 'Cash Bonus', icon: '💰' },
                      };
                      const typeInfo = typeLabels[template.type] || { label: template.type, icon: '🎁' };
                      return (
                        <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 rounded-full glow-cyan">
                          <span className="text-2xl mr-2">{typeInfo.icon}</span>
                          <span className="text-xl font-bold text-white">{template.name}</span>
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="border-t border-gray-700 pt-6 mb-8">
          <h2 className="text-2xl font-bold neon-cyan mb-4">📋 Requirements</h2>
          <p className="text-lg text-gray-300">{formatTriggerDescription()}</p>
        </div>

        {/* Progress Section */}
        {progress ? (
          <div className="border-t border-gray-700 pt-6 mb-8">
            <div className="flex justify-between text-lg text-gray-400 mb-4">
              <span>Progress</span>
              <span className="neon-cyan text-2xl font-bold">{Math.round(progress.progress)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-6 mb-4 overflow-hidden border-2 border-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 glow-gold'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-500 glow-cyan'
                }`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <div className="text-center text-gray-400 text-lg">
              {progress.currentValue} / {progress.targetValue}
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-700 pt-6 mb-8">
            <div className="text-center text-gray-500 text-xl">🔒 Not started yet</div>
          </div>
        )}

        {/* Status and Claim Button */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <span
              className={`px-6 py-3 rounded-full text-lg font-bold ${
                isClaimed
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white glow-gold'
                  : isCompleted
                  ? hasReward
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white glow-gold'
                    : 'glass-card border border-gray-700 text-gray-300'
                  : progress
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {isClaimed
                ? '✓ Reward Claimed'
                : isCompleted
                ? hasReward
                  ? '✨ Completed - Ready to Claim'
                  : 'Completed (No RP configured)'
                : progress
                ? '⏳ In Progress'
                : '🔒 Locked'}
            </span>
          </div>
          {canClaim && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold text-lg glow-gold shadow-2xl hover:scale-105 transition-all duration-300 animate-pulse"
            >
              🎁 Claim Reward
            </button>
          )}
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowClaimModal(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-yellow-500/50 glow-gold" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-3xl font-bold neon-gold mb-4">Claim Reward</h3>
              <p className="text-gray-300 text-lg mb-6">
                You are about to claim <strong className="neon-gold">{achievement.rewardPoints} Reward Points</strong> for completing this achievement.
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowClaimModal(false)}
                disabled={claiming}
                className="px-6 py-3 glass-card border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:border-gray-600 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-400 hover:to-yellow-500 font-bold glow-gold disabled:opacity-50 transition-all duration-300"
              >
                {claiming ? 'Claiming...' : '🎁 Confirm Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
