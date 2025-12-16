'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Rakeback {
  id: string;
  totalWager: number;
  rakebackAmount: number;
  claimed: boolean;
  claimedAt: string | null;
  createdAt: string;
  promotion: {
    id: string;
    name: string;
    startAt: string;
    endAt: string;
  };
}

export default function PlayerHistoryPage() {
  const router = useRouter();
  const [rakebacks, setRakebacks] = useState<Rakeback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.get('/player/promotions/history');
      setRakebacks(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rakeback History</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rakebacks.map((rakeback) => (
            <li key={rakeback.id}>
              <Link href={`/player/promotions/${rakeback.promotion.id}`}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-600">
                        {rakeback.promotion.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Wager: ${rakeback.totalWager.toFixed(2)} | Rakeback: ${rakeback.rakebackAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(rakeback.promotion.startAt).toLocaleDateString()} - {new Date(rakeback.promotion.endAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rakeback.claimed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rakeback.claimed ? 'Claimed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {rakebacks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No rakeback history found
          </div>
        )}
      </div>
    </div>
  );
}

