import { useState, useEffect } from 'react';
import type { Wager } from '../../lib/rakeback/types';
import { ProductType, StakeSourceType } from '../../lib/rakeback/types';

export default function AdminAuditPage() {
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWagers();
  }, []);

  const loadWagers = async () => {
    try {
      const response = await fetch('/api/admin/wagers');
      if (response.ok) {
        const data = await response.json();
        setWagers(data);
      }
    } catch (error) {
      console.error('Failed to load wagers:', error);
    } finally {
      setLoading(false);
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

  // Calculate totals
  const totalWagers = wagers.length;
  const totalWagerAmount = wagers.reduce((sum, w) => sum + w.amount, 0);
  const totalRakeback = wagers.reduce((sum, w) => sum + (w.rakebackEarned || 0), 0);
  const casinoWagers = wagers.filter(w => w.productType === ProductType.CASINO);
  const sportsWagers = wagers.filter(w => w.productType === ProductType.SPORTS);
  const eligibleWagers = wagers.filter(w => 
    w.stakeSourceType === StakeSourceType.REAL_CASH || 
    w.stakeSourceType === StakeSourceType.CLEARED_CASH
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="mt-2 text-sm text-gray-600">View all wagers and rakeback generated</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Wagers</div>
            <div className="text-2xl font-semibold text-gray-900">{totalWagers}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Wagered</div>
            <div className="text-2xl font-semibold text-gray-900">
              ${totalWagerAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Rakeback</div>
            <div className="text-2xl font-semibold text-indigo-600">
              ${totalRakeback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Eligible Wagers</div>
            <div className="text-2xl font-semibold text-green-600">{eligibleWagers.length}</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Casino Wagers</h3>
            <div className="text-2xl font-semibold text-gray-900">{casinoWagers.length}</div>
            <div className="text-sm text-gray-600 mt-1">
              ${casinoWagers.reduce((sum, w) => sum + w.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sportsbook Wagers</h3>
            <div className="text-2xl font-semibold text-gray-900">{sportsWagers.length}</div>
            <div className="text-sm text-gray-600 mt-1">
              ${sportsWagers.reduce((sum, w) => sum + w.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Wagers Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Wagers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category/Sport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stake Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rakeback</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wagers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-sm text-gray-500 text-center">
                      No wagers yet. Use the simulator to create wagers.
                    </td>
                  </tr>
                ) : (
                  wagers.slice().reverse().map((wager) => (
                    <tr key={wager.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(wager.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{wager.playerId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{wager.productType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {wager.casinoCategory || wager.sport || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${wager.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs rounded ${
                          wager.stakeSourceType === StakeSourceType.REAL_CASH || 
                          wager.stakeSourceType === StakeSourceType.CLEARED_CASH
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {wager.stakeSourceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                        ${(wager.rakebackEarned || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

