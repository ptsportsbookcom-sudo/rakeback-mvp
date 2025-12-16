import { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import type { BonusInstance } from '../../types';

const DEFAULT_PLAYER_ID = 'player-1';

export default function PlayerBonuses() {
  const [bonuses, setBonuses] = useState<BonusInstance[]>([]);

  useEffect(() => {
    loadBonuses();
    
    // Listen for updates
    const handleUpdate = () => loadBonuses();
    window.addEventListener('wallet-update', handleUpdate);
    
    return () => {
      window.removeEventListener('wallet-update', handleUpdate);
    };
  }, []);

  const loadBonuses = () => {
    const playerBonuses = api.getPlayerBonuses(DEFAULT_PLAYER_ID);
    setBonuses(playerBonuses);
  };

  const getBonusTypeBadge = (type: string) => {
    switch (type) {
      case 'freebet':
        return { label: 'Free Bet', color: 'bg-blue-500', icon: '🎯' };
      case 'freespins':
        return { label: 'Free Spins', color: 'bg-purple-500', icon: '🎰' };
      case 'cash':
        return { label: 'Cash Bonus', color: 'bg-green-500', icon: '💰' };
      default:
        return { label: type, color: 'bg-gray-500', icon: '🎁' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
      case 'used':
        return { label: 'Used', color: 'bg-gray-100 text-gray-800' };
      case 'expired':
        return { label: 'Expired', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-4xl font-bold neon-gold mb-8">🎁 My Bonuses</h2>

      {bonuses.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 border-2 border-cyan-500/30 text-center">
          <div className="text-6xl mb-4">🎰</div>
          <div className="text-xl text-gray-400">No bonuses yet. Complete achievements to earn bonuses!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonuses.map((bonus) => {
            const typeBadge = getBonusTypeBadge(bonus.type);
            const statusBadge = getStatusBadge(bonus.status);
            
            // Get source info
            let sourceName = '';
            let sourceIcon = '🎁';
            if (bonus.sourceType === 'achievement') {
              const achievement = api.getAchievement(bonus.sourceId);
              sourceName = achievement?.title || 'Unknown Achievement';
              sourceIcon = '🏆';
            } else if (bonus.sourceType === 'challenge') {
              const challenge = api.getChallenge(bonus.sourceId);
              sourceName = challenge?.title || 'Unknown Challenge';
              sourceIcon = '⚡';
            } else if (bonus.sourceType === 'quest') {
              const quest = api.getQuest(bonus.sourceId);
              sourceName = quest?.title || 'Unknown Quest';
              sourceIcon = '🗺️';
            }
            
            return (
              <div
                key={bonus.id}
                className="glass-card rounded-2xl p-6 border-2 border-cyan-500/30 hover:scale-105 transition-all duration-300"
              >
                {/* Bonus Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`${typeBadge.color} text-white px-4 py-2 rounded-full flex items-center space-x-2`}>
                    <span className="text-xl">{typeBadge.icon}</span>
                    <span className="font-semibold">{typeBadge.label}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Bonus Details */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{bonus.templateName}</h3>
                  <div className="text-lg neon-cyan mb-2">
                    {bonus.type === 'freespins' ? `${bonus.amount} Spins` : `€${bonus.amount}`}
                  </div>
                  {bonus.wagering && (
                    <div className="text-sm text-gray-400">
                      Wagering: {bonus.wagering}x
                    </div>
                  )}
                </div>

                {/* Source */}
                {sourceName && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-xs text-gray-400 mb-1">
                      From {bonus.sourceType === 'achievement' ? 'Achievement' : bonus.sourceType === 'challenge' ? 'Challenge' : 'Quest'}
                    </div>
                    <div className="text-sm text-cyan-400 font-medium flex items-center space-x-2">
                      <span>{sourceIcon}</span>
                      <span>{sourceName}</span>
                    </div>
                  </div>
                )}

                {/* Expiry */}
                {bonus.expiresAt && (
                  <div className="mt-4 text-xs text-gray-500">
                    Expires: {new Date(bonus.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



