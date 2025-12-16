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

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await api.get('/admin/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Failed to load promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.post(`/admin/promotions/${id}/activate`);
      loadPromotions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to activate');
    }
  };

  const handleEnd = async (id: string) => {
    try {
      await api.post(`/admin/promotions/${id}/end`);
      loadPromotions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to end');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Promotions</h2>
        <Link
          href="/admin/promotions/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Promotion
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {promotions.map((promo) => (
            <li key={promo.id}>
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {promo.name}
                    </p>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      promo.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      promo.status === 'ENDED' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
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
                <div className="ml-4 flex space-x-2">
                  <Link
                    href={`/admin/promotions/${promo.id}`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    View
                  </Link>
                  {promo.status === 'DRAFT' && (
                    <button
                      onClick={() => handleActivate(promo.id)}
                      className="text-green-600 hover:text-green-900 text-sm"
                    >
                      Activate
                    </button>
                  )}
                  {promo.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleEnd(promo.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      End
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

