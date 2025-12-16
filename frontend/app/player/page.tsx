'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Promotion {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  status: string;
  rakebackPercentage: number;
  overridePercentage: number;
}

export default function PlayerPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await api.get('/player/promotions/active');
      setPromotions(response.data);
    } catch (error) {
      console.error('Failed to load promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Promotions</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {promotions.map((promo) => (
            <li key={promo.id}>
              <Link href={`/player/promotions/${promo.id}`}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {promo.name}
                    </p>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {promo.status}
                    </span>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="text-sm text-gray-500">
                        RBP: {promo.rakebackPercentage}% | Override: {promo.overridePercentage}%
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 sm:mt-0">
                      {new Date(promo.startAt).toLocaleDateString()} - {new Date(promo.endAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

