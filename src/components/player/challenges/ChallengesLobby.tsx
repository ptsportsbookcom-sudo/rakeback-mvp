import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api/mockApi';
import type { Challenge, PlayerChallengeProgress } from '../../../types';

const DEFAULT_PLAYER_ID = 'player-1';

type FilterType = 'all' | 'in_progress' | 'completed';

export default function ChallengesLobby() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Record<string, PlayerChallengeProgress>>({});
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const activeChallenges = api.getChallenges().filter(c => c.status === 'active');
    setChallenges(activeChallenges);

    const playerProgress = api.getPlayerChallenges(DEFAULT_PLAYER_ID);
    const progressMap: Record<string, PlayerChallengeProgress> = {};
    playerProgress.forEach(p => {
      progressMap[p.challengeId] = p;
    });
    setProgress(progressMap);
  };

  const getChallengeState = (challengeId: string): 'locked' | 'in_progress' | 'completed' => {
    const prog = progress[challengeId];
    if (!prog) return 'locked';
    if (prog.completed) return 'completed';
    return 'in_progress';
  };

  const getTimeUntilReset = (_challenge: Challenge, prog?: PlayerChallengeProgress): string => {
    if (!prog) return '';
    const now = new Date();
    const cycleEnd = new Date(prog.cycleEndDate);
    const diff = cycleEnd.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    const state = getChallengeState(challenge.id);
    if (filter === 'in_progress') return state === 'in_progress';
    if (filter === 'completed') return state === 'completed';
    return true;
  });

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className="text-4xl font-bold neon-gold mb-6 md:mb-0">⚡ Challenges</h2>
        
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
        {filteredChallenges.map((challenge) => {
          const state = getChallengeState(challenge.id);
          const prog = progress[challenge.id];

          return (
            <Link
              key={challenge.id}
              to={`/player/challenge/${challenge.id}`}
              className={`glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 ${
                state === 'locked' ? 'opacity-50' : ''
              } ${
                state === 'completed' ? 'glow-gold border-2 border-yellow-500/50' : 'border border-white/10'
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                  state === 'completed' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 glow-gold' :
                  state === 'in_progress' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 glow-cyan' :
                  'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                  ⚡
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{challenge.description}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xs text-cyan-400">{challenge.frequency}</span>
                  {prog && (
                    <span className="text-xs text-yellow-400">⏰ {getTimeUntilReset(challenge, prog)}</span>
                  )}
                </div>
              </div>

              {(() => {
                const rewardType = challenge.reward?.type || challenge.rewardType;
                if (rewardType === 'points' || rewardType === 'both') {
                  const points = challenge.reward?.points || challenge.rewardPoints || 0;
                  if (points > 0) {
                    return (
                      <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 rounded-full flex items-center space-x-2 glow-gold">
                          <span className="text-lg">🪙</span>
                          <span className="font-bold text-white">{points} RP</span>
                        </div>
                      </div>
                    );
                  }
                }
                if (rewardType === 'bonus' || rewardType === 'both') {
                  const template = api.getBonusTemplate(challenge.reward?.bonusTemplateId || '');
                  if (template) {
                    const typeIcons: Record<string, string> = { freebet: '🎯', freespins: '🎰', cash: '💰' };
                    return (
                      <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full flex items-center space-x-2 glow-cyan">
                          <span className="text-lg">{typeIcons[template.type] || '🎁'}</span>
                          <span className="font-bold text-white">{template.name}</span>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}

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

              {state === 'completed' && prog && !prog.claimed && (
                <div className="mt-3 text-center">
                  <span className="text-xs neon-gold animate-pulse">✨ Claim Available!</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚡</div>
          <div className="text-xl text-gray-400">No challenges found for this filter.</div>
        </div>
      )}
    </div>
  );
}

