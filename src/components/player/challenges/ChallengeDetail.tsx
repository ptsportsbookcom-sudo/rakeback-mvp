import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../api/mockApi';
import type { Challenge, PlayerChallengeProgress } from '../../../types';

const DEFAULT_PLAYER_ID = 'player-1';

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<PlayerChallengeProgress | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    if (progress) {
      const interval = setInterval(() => {
        const now = new Date();
        const cycleEnd = new Date(progress.cycleEndDate);
        const diff = cycleEnd.getTime() - now.getTime();
        if (diff <= 0) {
          setTimeUntilReset('Expired');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilReset(`${hours}h ${minutes}m`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [progress]);

  const loadData = () => {
    if (!id) return;
    const ch = api.getChallenge(id);
    setChallenge(ch || null);

    const prog = api.getPlayerChallengeProgress(DEFAULT_PLAYER_ID, id);
    setProgress(prog || null);
  };

  const handleClaim = () => {
    if (!id) return;
    setClaiming(true);
    const success = api.claimChallengeReward(DEFAULT_PLAYER_ID, id);
    setClaiming(false);
    if (success) {
      setShowClaimModal(false);
      loadData();
      window.dispatchEvent(new Event('wallet-update'));
      setTimeout(() => {
        alert('Reward claimed successfully!');
      }, 100);
    } else {
      alert('Failed to claim reward.');
    }
  };

  if (!challenge) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">⚡</div>
          <div className="text-xl">Challenge not found.</div>
        </div>
      </div>
    );
  }

  const status = progress?.status || (progress?.claimed ? 'CLAIMED' : progress?.completed ? 'COMPLETED' : 'IN_PROGRESS');
  const isCompleted = status === 'COMPLETED' || progress?.completed || false;
  const isClaimed = status === 'CLAIMED' || progress?.claimed || false;
  const rewardType = challenge.reward?.type || challenge.rewardType;
  const hasReward = !!rewardType;
  const canClaim = isCompleted && !isClaimed && hasReward;

  return (
    <div className="px-4 py-6 sm:px-0">
      <button
        onClick={() => navigate('/player/challenges')}
        className="mb-6 glass-card px-6 py-3 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:bg-white/10 border border-cyan-500/20"
      >
        ← Back to Challenges
      </button>

      <div className="glass-card rounded-3xl p-8 md:p-12 border-2 border-cyan-500/30 relative overflow-hidden">
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
            ⚡
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{challenge.title}</h1>
            <p className="text-lg text-gray-300 mb-6">{challenge.description}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="glass-card px-4 py-2 rounded-full border border-cyan-500/20">
                <span className="text-sm text-cyan-400">Frequency: {challenge.frequency}</span>
              </div>
              {progress && (
                <div className="glass-card px-4 py-2 rounded-full border border-yellow-500/20">
                  <span className="text-sm text-yellow-400">⏰ {timeUntilReset} until reset</span>
                </div>
              )}
            </div>
            {hasReward && (
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                {rewardType === 'points' || rewardType === 'both' ? (
                  <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3 rounded-full glow-gold">
                    <span className="text-2xl mr-2">🪙</span>
                    <span className="text-xl font-bold text-white">{challenge.reward?.points || challenge.rewardPoints || 0} RP</span>
                  </div>
                ) : null}
                {rewardType === 'bonus' || rewardType === 'both' ? (() => {
                  const template = api.getBonusTemplate(challenge.reward?.bonusTemplateId || '');
                  if (template) {
                    const typeIcons: Record<string, string> = { freebet: '🎯', freespins: '🎰', cash: '💰' };
                    return (
                      <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 rounded-full glow-cyan">
                        <span className="text-2xl mr-2">{typeIcons[template.type] || '🎁'}</span>
                        <span className="text-xl font-bold text-white">{template.name}</span>
                      </div>
                    );
                  }
                  return null;
                })() : null}
              </div>
            )}
          </div>
        </div>

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

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <span
              className={`px-6 py-3 rounded-full text-lg font-bold ${
                isClaimed
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white glow-gold'
                  : isCompleted
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white glow-gold'
                  : progress
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {isClaimed
                ? '✓ Reward Claimed'
                : isCompleted
                ? '✨ Completed - Ready to Claim'
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

      {showClaimModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowClaimModal(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-yellow-500/50 glow-gold" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-3xl font-bold neon-gold mb-4">Claim Reward</h3>
              <p className="text-gray-300 text-lg mb-6">
                Claim your reward for completing this challenge.
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

