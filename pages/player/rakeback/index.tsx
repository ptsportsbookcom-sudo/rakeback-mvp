import { useState, useEffect } from 'react';

interface RakebackStatus {
  config: {
    enabled: boolean;
    rakebackPercentage: number;
    overridePercentage: number;
  };
  rakeback: {
    totalWager: number;
    casinoWager: number;
    sportsWager: number;
    effectiveHouseEdge: number;
    accruedRakeback: number;
    claimedRakeback: number;
    lastClaimedAt?: string;
  };
}

export default function PlayerRakebackPage() {
  const [status, setStatus] = useState<RakebackStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [playerId] = useState('player-1'); // In real app, get from auth/session

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch(`/api/rakeback/status?playerId=${playerId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load rakeback status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!status || status.rakeback.accruedRakeback <= 0) return;

    if (!confirm(`Claim $${status.rakeback.accruedRakeback.toFixed(2)} in rakeback?`)) {
      return;
    }

    setClaiming(true);
    try {
      const response = await fetch('/api/rakeback/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (response.ok) {
        await loadStatus();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to claim rakeback');
      }
    } catch (error) {
      console.error('Failed to claim rakeback:', error);
      alert('Failed to claim rakeback');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">Failed to load rakeback status</div>
        </div>
      </div>
    );
  }

  if (!status.config.enabled) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Rakeback</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm text-yellow-800">Rakeback is currently disabled.</p>
          </div>
        </div>
      </div>
    );
  }

  const { rakeback, config } = status;
  const claimableRakeback = rakeback.accruedRakeback;
  const pendingRakeback = rakeback.accruedRakeback;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Rakeback</h1>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-sm text-gray-600 mb-1">Total Wager</div>
            <div className="text-2xl font-semibold text-gray-900">
              ${rakeback.totalWager.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-sm text-gray-600 mb-1">Effective House Edge</div>
            <div className="text-2xl font-semibold text-gray-900">
              {(rakeback.effectiveHouseEdge * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-sm text-gray-600 mb-1">Rakeback %</div>
            <div className="text-2xl font-semibold text-gray-900">
              {config.rakebackPercentage}%
            </div>
          </div>
        </div>

        {/* Rakeback Summary */}
        <div className="bg-white border border-gray-200 rounded mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Rakeback Summary</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Pending Rakeback</div>
                <div className="text-3xl font-semibold text-gray-900">
                  ${pendingRakeback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Claimable Rakeback</div>
                <div className="text-3xl font-semibold text-indigo-600">
                  ${claimableRakeback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Claimed</div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${rakeback.claimedRakeback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {rakeback.lastClaimedAt && (
              <div className="text-sm text-gray-500 mb-4">
                Last claimed: {new Date(rakeback.lastClaimedAt).toLocaleString()}
              </div>
            )}

            {claimableRakeback > 0 && (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? 'Claiming...' : 'Claim Rakeback'}
              </button>
            )}

            {claimableRakeback === 0 && rakeback.claimedRakeback === 0 && (
              <div className="text-sm text-gray-500">
                No rakeback accrued yet. Start wagering to earn rakeback.
              </div>
            )}
          </div>
        </div>

        {/* Wager Breakdown */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Wager Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Casino Wager</span>
                <span className="text-sm font-medium text-gray-900">
                  ${rakeback.casinoWager.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Sports Wager</span>
                <span className="text-sm font-medium text-gray-900">
                  ${rakeback.sportsWager.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Override Percentage</span>
                <span className="text-sm font-medium text-gray-900">
                  {config.overridePercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

