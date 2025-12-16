'use client';

import { useEffect, useState } from 'react';

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
  const [playerId] = useState('player-1'); // In real app, get from auth

  useEffect(() => {
    loadStatus();
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

    setClaiming(true);
    try {
      const response = await fetch('/api/rakeback/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });

      if (response.ok) {
        alert('Rakeback claimed successfully!');
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
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!status) {
    return <div className="text-center py-12">Failed to load rakeback status</div>;
  }

  if (!status.config.enabled) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Rakeback</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">Rakeback is currently disabled.</p>
        </div>
      </div>
    );
  }

  const { rakeback, config } = status;

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Rakeback</h2>

      {/* Configuration Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Current Settings</h3>
        <div className="text-sm text-blue-800">
          <p>Rakeback Percentage: {config.rakebackPercentage}%</p>
          <p>Override Percentage: {config.overridePercentage}%</p>
        </div>
      </div>

      {/* Wager Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Wager Summary</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Wager</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900">
              ${rakeback.totalWager.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Casino Wager</dt>
            <dd className="mt-1 text-lg text-gray-900">
              ${rakeback.casinoWager.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sports Wager</dt>
            <dd className="mt-1 text-lg text-gray-900">
              ${rakeback.sportsWager.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Effective House Edge</dt>
            <dd className="mt-1 text-lg text-gray-900">
              {(rakeback.effectiveHouseEdge * 100).toFixed(2)}%
            </dd>
          </div>
        </dl>
      </div>

      {/* Rakeback Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Rakeback Summary</h3>
        <dl className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Accrued Rakeback</dt>
            <dd className="mt-1 text-3xl font-bold text-indigo-600">
              ${rakeback.accruedRakeback.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Claimed</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900">
              ${rakeback.claimedRakeback.toFixed(2)}
            </dd>
          </div>
        </dl>

        {rakeback.lastClaimedAt && (
          <p className="text-sm text-gray-500">
            Last claimed: {new Date(rakeback.lastClaimedAt).toLocaleString()}
          </p>
        )}

        {rakeback.accruedRakeback > 0 && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="mt-4 w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {claiming ? 'Claiming...' : 'Claim Rakeback'}
          </button>
        )}

        {rakeback.accruedRakeback === 0 && rakeback.claimedRakeback === 0 && (
          <p className="text-sm text-gray-500 mt-4">
            No rakeback accrued yet. Start wagering to earn rakeback!
          </p>
        )}
      </div>

      {/* Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Casino Rakeback:</span>
            <span className="font-medium">
              ${((rakeback.casinoWager * rakeback.effectiveHouseEdge * config.rakebackPercentage / 100 * config.overridePercentage / 100)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sports Rakeback:</span>
            <span className="font-medium">
              ${((rakeback.sportsWager * rakeback.effectiveHouseEdge * config.rakebackPercentage / 100 * config.overridePercentage / 100)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

