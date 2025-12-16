import { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';

const DEFAULT_PLAYER_ID = 'player-1';

export default function PlayerWallet() {
  const [wallet, setWallet] = useState({ rewardPoints: 0 });
  const [animatedRP, setAnimatedRP] = useState(0);

  useEffect(() => {
    loadWallet();
    
    // Listen for wallet updates
    const handleUpdate = () => loadWallet();
    window.addEventListener('wallet-update', handleUpdate);
    
    return () => {
      window.removeEventListener('wallet-update', handleUpdate);
    };
  }, []);

  useEffect(() => {
    // Animate RP counter
    const target = wallet.rewardPoints;
    const duration = 1000;
    const steps = 60;
    const increment = (target - animatedRP) / steps;
    const stepDuration = duration / steps;

    if (Math.abs(target - animatedRP) > 0.01) {
      const timer = setInterval(() => {
        setAnimatedRP(prev => {
          const next = prev + increment;
          if ((increment > 0 && next >= target) || (increment < 0 && next <= target)) {
            clearInterval(timer);
            return target;
          }
          return next;
        });
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [wallet.rewardPoints]);

  const loadWallet = () => {
    const walletData = api.getWallet(DEFAULT_PLAYER_ID);
    setWallet(walletData);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-4xl font-bold neon-gold mb-8">💰 My Wallet</h2>

      {/* Main Wallet Card */}
      <div className="glass-card rounded-3xl p-12 border-2 border-yellow-500/30 glow-gold mb-8">
        <div className="text-center">
          {/* Animated Coin Icon */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-6xl glow-gold"
              style={{ animation: 'coin-spin 3s linear infinite' }}
            >
              🪙
            </div>
          </div>

          {/* Balance Label */}
          <h3 className="text-xl text-gray-400 mb-4 uppercase tracking-wider">Reward Points Balance</h3>
          
          {/* Animated Balance */}
          <div className="text-7xl md:text-8xl font-bold neon-gold mb-6">
            {Math.round(animatedRP)}
          </div>
          <div className="text-2xl text-gray-400 mb-8">RP</div>

          {/* Description */}
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Earn reward points by completing achievements and claim them here!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-cyan-500/20">
          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-bold neon-cyan mb-1">Achievements</div>
            <div className="text-gray-400">Complete to earn RP</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-purple-500/20">
          <div className="text-center">
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-2xl font-bold neon-magenta mb-1">Rewards</div>
            <div className="text-gray-400">Claim your prizes</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-yellow-500/20">
          <div className="text-center">
            <div className="text-4xl mb-2">💎</div>
            <div className="text-2xl font-bold neon-gold mb-1">VIP Status</div>
            <div className="text-gray-400">Keep earning!</div>
          </div>
        </div>
      </div>
    </div>
  );
}


