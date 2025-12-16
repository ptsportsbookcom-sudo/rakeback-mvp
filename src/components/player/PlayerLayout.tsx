import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';

const DEFAULT_PLAYER_ID = 'player-1';

export default function PlayerLayout() {
  const location = useLocation();
  const [wallet, setWallet] = useState({ rewardPoints: 0 });

  useEffect(() => {
    loadWallet();
    
    // Listen for wallet updates
    const handleUpdate = () => loadWallet();
    window.addEventListener('wallet-update', handleUpdate);
    
    return () => {
      window.removeEventListener('wallet-update', handleUpdate);
    };
  }, [location.pathname]);

  const loadWallet = () => {
    const walletData = api.getWallet(DEFAULT_PLAYER_ID);
    setWallet(walletData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <nav className="relative z-10 glass-card border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center mr-8">
                <h1 className="text-2xl font-bold neon-cyan">🎰 CASINO PORTAL</h1>
              </div>
              <div className="hidden sm:flex sm:space-x-2 flex-wrap">
                <Link
                  to="/player/achievements"
                  className={`inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                    location.pathname === '/player' || location.pathname.startsWith('/player/achievement')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                      : 'glass-card text-gray-300 hover:text-cyan-400 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">🏆</span>
                  <span className="hidden md:inline">Achievements</span>
                  <span className="md:hidden">Achieve</span>
                </Link>
                <Link
                  to="/player/challenges"
                  className={`inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                    location.pathname.startsWith('/player/challenge')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                      : 'glass-card text-gray-300 hover:text-cyan-400 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">⚡</span>
                  <span className="hidden md:inline">Challenges</span>
                  <span className="md:hidden">Challenge</span>
                </Link>
                <Link
                  to="/player/quests"
                  className={`inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                    location.pathname.startsWith('/player/quest')
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                      : 'glass-card text-gray-300 hover:text-cyan-400 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">🗺️</span>
                  <span className="hidden md:inline">Quests</span>
                  <span className="md:hidden">Quests</span>
                </Link>
                <Link
                  to="/player/wallet"
                  className={`inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                    location.pathname === '/player/wallet'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                      : 'glass-card text-gray-300 hover:text-cyan-400 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">💰</span>
                  <span className="hidden md:inline">Wallet</span>
                  <span className="md:hidden">Wallet</span>
                </Link>
                <Link
                  to="/player/bonuses"
                  className={`inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                    location.pathname === '/player/bonuses'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan shadow-lg'
                      : 'glass-card text-gray-300 hover:text-cyan-400 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">🎁</span>
                  <span className="hidden md:inline">Bonuses</span>
                  <span className="md:hidden">Bonus</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="glass-card px-6 py-3 rounded-lg border border-yellow-500/30">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl" style={{ animation: 'coin-spin 3s linear infinite' }}>🪙</span>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">Reward Points</div>
                    <div className="text-xl font-bold neon-gold">{wallet.rewardPoints}</div>
                  </div>
                </div>
              </div>
              <Link
                to="/admin"
                className="glass-card text-gray-300 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10"
              >
                ⚙️ Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <Outlet context={{ loadWallet }} />
      </main>
    </div>
  );
}

