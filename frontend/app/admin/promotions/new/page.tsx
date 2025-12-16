'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function NewPromotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    startAt: '',
    endAt: '',
    rakebackPercentage: 10,
    overridePercentage: 100,
    globalMargin: 0.08,
    casinoRtpFloors: {
      SLOTS: 0.90,
      LIVE: 0.95,
      TABLE: 0.92,
      CRASH: 0.88,
      OTHER: 0.90,
    },
    sportMarginFloors: {
      FOOTBALL: 0.08,
      TENNIS: 0.10,
      BASKETBALL: 0.09,
      ESPORTS: 0.12,
      OTHER: 0.08,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/promotions', formData);
      router.push('/admin');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create promotion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Promotion</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Brand ID</label>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.brandId}
            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="datetime-local"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.endAt}
              onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rakeback Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.rakebackPercentage}
              onChange={(e) => setFormData({ ...formData, rakebackPercentage: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Override Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="200"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.overridePercentage}
              onChange={(e) => setFormData({ ...formData, overridePercentage: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Global Margin</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.globalMargin}
            onChange={(e) => setFormData({ ...formData, globalMargin: parseFloat(e.target.value) })}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

