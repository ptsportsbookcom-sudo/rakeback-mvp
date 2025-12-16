'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

export default function PlayerPromotionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [params.id]);

  const loadStatus = async () => {
    try {
      const response = await api.get(`/player/promotions/${params.id}/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      await api.post(`/player/promotions/${params.id}/claim`);
      alert('Rakeback claimed successfully!');
      loadStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to claim rakeback');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!status) {
    return <div className="text-center py-12">No data found</div>;
  }

  const { promotion, rakeback, summary } = status;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-900 mb-4"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{promotion.name}</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Your Wager Summary</h3>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Wager</dt>
            <dd className="mt-1 text-sm text-gray-900">${summary.totalWager?.toFixed(2) || 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Casino Wager</dt>
            <dd className="mt-1 text-sm text-gray-900">${summary.casinoWager?.toFixed(2) || 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sports Wager</dt>
            <dd className="mt-1 text-sm text-gray-900">${summary.sportsWager?.toFixed(2) || 0}</dd>
          </div>
        </dl>
      </div>

      {rakeback && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Your Rakeback</h3>
          <dl className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Effective House Edge</dt>
              <dd className="mt-1 text-sm text-gray-900">{(rakeback.effectiveHouseEdge * 100).toFixed(2)}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rakeback Amount</dt>
              <dd className="mt-1 text-lg font-bold text-indigo-600">${rakeback.rakebackAmount.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {rakeback.claimed ? 'Claimed' : 'Available'}
              </dd>
            </div>
          </dl>

          {promotion.status === 'ENDED' && !rakeback.claimed && (
            <button
              onClick={handleClaim}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Claim Rakeback
            </button>
          )}

          {rakeback.claimed && (
            <p className="text-sm text-gray-500">
              Claimed on {new Date(rakeback.claimedAt!).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {!rakeback && promotion.status === 'ENDED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Rakeback has not been generated yet. Please contact support.
          </p>
        </div>
      )}
    </div>
  );
}

